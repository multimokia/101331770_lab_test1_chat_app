import express from "express";
import { Server } from "http";
import { config } from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { router as userRouter } from "./routes/api/v1/user.js";
import { router as messagesRouter } from "./routes/api/v1/[room]/messages.js";
import { connect } from "mongoose";
import { createMessage } from "./services/message.service.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix globals here
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration from .env file
config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";

// Connect to our database
connect(
    MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

// Init our express server and socketio server
const app = express();
const server = new Server(app);
const io = new SocketIOServer(server);

// Add json parsing to our express server
app.use(express.json());

// Add public dir to host html and create its route
app.use("/static", express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/pages/index.html`);
});

app.get("/chat", (req, res) => {
    res.sendFile(`${__dirname}/pages/chat.html`);
});

app.get("/register", (req, res) => {
    res.sendFile(`${__dirname}/pages/register.html`);
});

// Add in our routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1", messagesRouter);

// Run server
server.listen(
    PORT,
    () => console.log(`Server listening on port ${PORT}`)
);

const rooms = {};

// Now prep our socket connection
io.on("connection", (socket) => {
    socket.on("user_join", (user, room) => {
        console.log(`${user.username} has joined ${room}`);

        // If room isn't stored, we add it
        if (rooms[room] === undefined) {
            rooms[room] = { }
        }

        // And add the user to the room by id
        rooms[room][user._id] = user.username;

        // Finally, officially do this on socket.io
        socket.join(room);

        // Send the list of users in this channel
        io.to(room).emit("server_broadcast_room_users", rooms[room]);

        // And broadcast that the user has joined
        io.to(room).emit("server_broadcast_user_join", user.username);
    });

    socket.on("user_sends_message", async (author_username, room, content) => {
        const message = await createMessage(author_username, room, content);
        console.log(`[${message.room}]: ${message.author} sent a message: ${message.content} - ${message.sent_time}`);
        io.to(message.room).emit("server_broadcast_user_message", message);
    });

    socket.on("user_leave", (user, room) => {
        console.log(`${user.username} has left ${room}`);

        // Remove user from room
        delete rooms[room][user._id];
        socket.leave(room);

        // And broadcast that the user has left
        io.to(room).emit("server_broadcast_user_leave", user.username);

        // Send an updated list of users
        io.to(room).emit("server_broadcast_room_users", rooms[room]);
    });
});
