import ApiError from "../utils/ApiError.js";
import { validatePositiveId } from "./common.validator.js";

const allowedSlots = new Set([
    "Morning fasting",
    "After breakfast",
    "After lunch",
    "After dinner",
]);

export function validateReadingDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new ApiError(400, "A valid reading date is required.");
    }

    const parsedDate = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
        throw new ApiError(400, "Invalid reading date.");
    }

    if (value > new Date().toISOString().slice(0, 10)) {
        throw new ApiError(400, "Reading date cannot be in the future.");
    }

    return value;
}

export function validateReadingPayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new ApiError(400, "A reading object is required.");
    }

    const readingDate = validateReadingDate(payload.readingDate);
    if (typeof payload.slot !== "string" || !allowedSlots.has(payload.slot)) {
        throw new ApiError(400, "Please select a valid reading slot.");
    }

    const rawValue = payload.value;
    const value = typeof rawValue === "number"
        ? rawValue
        : typeof rawValue === "string" && rawValue.trim()
            ? Number(rawValue)
            : Number.NaN;

    if (!Number.isSafeInteger(value) || value < 40 || value > 600) {
        throw new ApiError(400, "Glucose value must be an integer between 40 and 600.");
    }

    return { readingDate, slot: payload.slot, value };
}

export function validateReadingId(value) {
    return validatePositiveId(value, "Reading ID");
}