import express from "express";
import { Server } from "http";
import { config } from "dotenv";
import { Server as SocketIOServer } from "socket.io";

// Load configuration from .env file
config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";

// Init our express server and
const app = express();
const server = new Server(app);

// Add public dir to host local file
app.use(express.static("public"));

// Run server
server.listen(
    PORT,
    () => console.log(`Server listening on port ${PORT}`)
);
