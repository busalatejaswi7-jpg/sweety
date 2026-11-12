import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import pool from "../config/db.js";

export function authenticateToken(req, res, next) {
    const [scheme, token] = (req.get("authorization") || "").split(" ");
    if (scheme !== "Bearer" || !token) {
        return next(new ApiError(401, "Access denied. Please login."));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload || typeof payload !== "object" || !Number.isSafeInteger(payload.userId)) {
            throw new Error("Invalid token payload.");
        }
        req.user = payload;
        return next();
    } catch {
        return next(new ApiError(401, "Invalid or expired token."));
    }
}

export function requireRole(role) {
    return async (req, res, next) => {
        try {
            const result = await pool.query(
                "SELECT role FROM users WHERE id = $1",
                [req.user.userId]
            );

            if (!result.rows[0]) {
                return next(new ApiError(401, "Account no longer exists."));
            }
            if (result.rows[0].role !== role) {
                return next(new ApiError(403, "This account is not permitted to access this resource."));
            }

            req.user.role = result.rows[0].role;
            return next();
        } catch (error) {
            return next(error);
        }
    };
}