const socket = io(window.location.origin);

const messageContainerElement = document.getElementById("message-container");
const messageFormElement = document.getElementById("send-container");
const messageInputElement = document.getElementById("message-input");

// We only get here if we are logged in. The user is stored in the session
const USER = JSON.parse(sessionStorage.getItem("user"));

// If we are not logged in, we redirect to the login page
if (USER === null) {
    window.location.href = "/";
}

appendMessage('You joined')
socket.emit('user_join', name)

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}


socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`)
});

socket.on('user-connected', name => {
    appendMessage(`${name} connected`)
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`)
});

messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  messageInput.value = ''
});
