import ApiError from "../utils/ApiError.js";

export function validatePositiveId(value, label = "ID") {
    const text = typeof value === "number" ? String(value) : value;
    if (typeof text !== "string" || !/^[1-9]\d*$/.test(text) || !Number.isSafeInteger(Number(text))) {
        throw new ApiError(400, `${label} must be a positive integer.`);
    }

    return Number(text);
}