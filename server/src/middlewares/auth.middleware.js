import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export function authenticateToken(req, res, next) {
    const [scheme, token] = (req.get("authorization") || "").split(" ");
    if (scheme !== "Bearer" || !token) {
        return next(new ApiError(401, "Access denied. Please login."));
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return next(new ApiError(401, "Invalid or expired token."));
    }
}