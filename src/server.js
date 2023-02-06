import express from "express";
import { Server } from "http";
import { config } from "dotenv";
import { Server as SocketIOServer } from "socket.io";

// Load configuration from .env file
config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";

// Init our express server and socketio server
const app = express();
const server = new Server(app);
const io = SocketIOServer(server);

// Add public dir to host html and create its route
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
});

// Run server
server.listen(
    PORT,
    () => console.log(`Server listening on port ${PORT}`)
);

const rooms = {};

// Now prep our socket connection
io.on("connection", (socke) => {
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

    socket.on("user_sends_message", (message) => {
        socket.to(message.room).emit(message);
    });

    socket.on("user_leave", (user, room) => {
        console.log(`${user.username} has left ${room}`);

        // Remove user from room
        delete rooms[room].users[user.id];
        socket.leave(room)
    });
});
