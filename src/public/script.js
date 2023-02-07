const socket = io(window.location.origin);

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// We only get here if we are logged in. The user is stored in the session
const USER = JSON.parse(sessionStorage.getItem("user"));
const ROOM = sessionStorage.getItem("server");

// If we are not logged in, we redirect to the login page
if (USER === null) {
    window.location.href = "/";
}

// Join chatroom
socket.emit('user_join', USER, ROOM);

// Populate the chat with the messages from the database
fetch(`/api/v1/${ROOM}/messages`)
    .then(res => res.json()).then(data => {
        console.log(data);
        data.forEach(message => {
            outputMessage(message);
        });

        // Now scroll down to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    })
    .catch(err => {
        console.error(err);
    });

// Get room and users
socket.on('server_broadcast_room_users', (users) => {
    console.log(users);
    roomName.innerText = ROOM;
    outputUsers(users);
});

// Message from server
socket.on('server_broadcast_user_message', (message) => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit('user_sends_message', USER.username, ROOM, msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    // First, make a wrapper for the message
    const msgContainer = document.createElement('div');
    msgContainer.classList.add('message');

    // Then, make the header (author and time)
    const msgHeader = document.createElement('p');
    msgHeader.classList.add('meta');
    msgHeader.innerText = message.author;

    // Let's format the time to 12 hour time
    const sentTime = new Date(message.sent_time);
    msgHeader.innerHTML += ` <span>${sentTime.toLocaleTimeString()}</span>`;

    msgContainer.appendChild(msgHeader);
    const msgBody = document.createElement('p');
    msgBody.classList.add('text');
    msgBody.innerText = message.content;
    msgContainer.appendChild(msgBody);

    // Finally append this to the chat messages
    document.querySelector('.chat-messages').appendChild(msgContainer);
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';

    for (let username of Object.values(users)) {
        const li = document.createElement('li');
        li.innerText = username;
        userList.appendChild(li);
    };
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', function() {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        socket.emit("user_leave", USER, ROOM);
        window.location = '../';
    }
});
