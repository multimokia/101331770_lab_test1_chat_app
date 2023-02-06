import { Schema, model } from "mongoose";

const UserModel = new Schema({
    username: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    password: { type: String, required: true },
    account_creation_time: { type: Date, required: true }
});
