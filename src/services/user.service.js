import { UserSchema as Users } from "../schemas/user.js";
import bcrypt from "bcrypt";

export async function registerUser(username, password, firstname, lastname) {
    // NOTE: username is enforced to be unique in the schema
    // so we don't need to check for it here
    const user = new Users({
        username,
        password: await bcrypt.hash(password, 10),
        first_name: firstname,
        last_name: lastname,
        account_creation_time: new Date()
    });

    return await user.save();
}

export async function loginUser(username, password) {
    const user = await Users.findOne({ username }).select("-__v");

    // If the user doesn't exist, return false (no acct/invalid details)
    if (!user) {
        return null;
    }

    // Compare the password with the hashed password
    const isValidCredentials = await bcrypt.compare(password, user.password);

    if (isValidCredentials) {
        return user;
    }

    return null;
}
