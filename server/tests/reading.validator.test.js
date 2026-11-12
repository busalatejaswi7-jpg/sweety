import { describe, expect, test } from "@jest/globals";
import {
    validateReadingDate,
    validateReadingId,
    validateReadingPayload,
} from "../src/validators/reading.validator.js";

const validPayload = {
    readingDate: "2026-01-15",
    slot: "Morning fasting",
    value: 110,
};

describe("reading request validation", () => {
    test("accepts and normalizes a valid reading", () => {
        expect(validateReadingPayload({ ...validPayload, value: "110" })).toEqual(validPayload);
    });

    test.each([null, [], "reading"])("rejects invalid payload shape: %p", (payload) => {
        expect(() => validateReadingPayload(payload)).toThrow(/reading object/i);
    });

    test.each(["2026-02-30", "not-a-date", "2026-01-15T00:00:00Z"])("rejects invalid date %s", (date) => {
        expect(() => validateReadingDate(date)).toThrow(/date/i);
    });

    test("rejects future dates", () => {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        expect(() => validateReadingDate(tomorrow)).toThrow(/future/i);
    });

    test("rejects unsupported slots", () => {
        expect(() => validateReadingPayload({ ...validPayload, slot: "Before bed" })).toThrow(/slot/i);
    });

    test.each([39, 600.5, 601, Number.NaN])("rejects invalid glucose value %p", (value) => {
        expect(() => validateReadingPayload({ ...validPayload, value })).toThrow(/integer between 40 and 600/i);
    });

    test("accepts positive safe integer IDs and rejects unsafe identifiers", () => {
        expect(validateReadingId("42")).toBe(42);
        expect(() => validateReadingId("0")).toThrow(/positive integer/i);
        expect(() => validateReadingId("1 OR 1=1")).toThrow(/positive integer/i);
        expect(() => validateReadingId("9007199254740992")).toThrow(/positive integer/i);
    });
});