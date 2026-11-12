import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
    const data = await authService.signup(req.body);
    res.status(201).json({ success: true, message: "Registration successful.", data });
});

export const login = asyncHandler(async (req, res) => {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, message: "Login successful.", data });
});