import { MessagesModel as Messages } from "../schemas/message.js";

export const createMessage = async (username, room, content) => {
    const message = new Messages({
        room,
        content,
        from_user: username,
        sent_time: new Date()
    });

    return await message.save();
}

export const getMessagesInRoom = async (room) => {
    // We only return the last 100 messages in reverse order from their sent time
    return await Messages
        .find({ room })
        .limit(100)
        .sort({ sent_time: -1 });
}
