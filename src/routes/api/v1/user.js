import { Router } from "express";
import { registerUser, loginUser } from "../../../services/user.service.js";

const router = Router();

// requires username, password, firstname, lastname in body
router.post("/register", async (req, res) => {
    const { username, password, firstname, lastname } = req.body;

    try {
        return res.status(201).send(await registerUser(username, password, firstname, lastname));
    }

    // If we get an error, we send it back to the client
    catch (error) {
        return res.status(400).send(error.message);
    }
});

// requires username and password in body
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await loginUser(username, password);

        if (!user) {
            return res.status(401).send({ data: null, error: "Invalid username or password" });
        }

        return res.status(200).send({ data: user, error: null });
    }

    // If we get an error, we send it back to the client
    catch (error) {
        return res.status(401).send({ error: error.message });
    }
});

export { router };
