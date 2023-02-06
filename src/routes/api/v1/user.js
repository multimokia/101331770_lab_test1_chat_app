import { Router } from "express";
import { registerUser } from "../../../services/user.service";

const router = Router();

// requires username, password, firstname, lastname in body
router.post("/register", async (req, res) => {
    return res.send(await registerUser(...req.body));
});

// requires username and password in body
router.post("/login", async (req, res) => {
    return res.send(await loginUser(...req.body));
});

export { router };
