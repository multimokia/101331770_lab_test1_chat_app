import { Router } from "express";

const router = Router();

router.get("/:room/messages", async (req, res) => {
    res.send(await getMessagesInRoom(req.params.room));
});

export { router };
