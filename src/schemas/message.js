import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
    author: { type: String, required: true },
    room: { type: String, required: true },
    content: { type: String, required: true },
    sent_time: { type: Date, required: true }
});

export const MessagesModel = model("messages", MessageSchema);
