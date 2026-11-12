import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { createUser, findUserByEmail } from "../repositories/auth.repository.js";

export async function signup({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) throw new ApiError(409, "Email already registered.");

    const passwordHash = await bcrypt.hash(password, 12);
    try {
        const user = await createUser({ name: name.trim(), email: normalizedEmail, passwordHash });
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        return { user, token };
    } catch (error) {
        if (error.code === "23505") throw new ApiError(409, "Email already registered.");
        throw error;
    }
}

export async function login({ email, password }) {
    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new ApiError(401, "Invalid email or password.");
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
}