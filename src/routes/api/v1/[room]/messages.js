import { Router } from "express";
import { getMessagesInRoom } from "../../../../services/message.service.js";

const router = Router();

router.get("/:room/messages", async (req, res) => {
    res.send(await getMessagesInRoom(req.params.room));
});

export { router };
