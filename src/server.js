import express from "express";
import { Server } from "http";
import { config } from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { router as userRouter } from "./routes/api/v1/user.js";
import { router as messagesRouter } from "./routes/api/v1/[room]/messages.js";
import { connect } from "mongoose";
import { createMessage } from "./services/message.service.js";

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
const io = SocketIOServer(server);

// Add public dir to host html and create its route
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
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
            rooms[room] = { users: {} }
        }

        // And add the user to the room by id
        rooms[room].users[user.id] = user;

        // Finally, officially do this on socket.io
        socket.join(room);

        // And broadcast that the user has joined
        socket.to(room).emit("server_broadcast_user_join", user);
    });

    socket.on("user_sends_message", async (author_username, room, content) => {
        const message = await createMessage(author_username, room, content);
        socket.to(message.room).emit(message);
    });

    socket.on("user_leave", (user, room) => {
        console.log(`${user.username} has left ${room}`);

        // Remove user from room
        delete rooms[room].users[user.id];
        socket.leave(room)
    });
});
