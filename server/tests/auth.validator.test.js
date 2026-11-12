import { describe, expect, test } from "@jest/globals";
import { validateLoginPayload, validateSignupPayload } from "../src/validators/auth.validator.js";

describe("auth request validation", () => {
    test("accepts valid signup data", () => {
        expect(validateSignupPayload({ name: "Sam", email: "sam@example.com", password: "password123", confirmPassword: "password123" })).toBeNull();
    });

    test("rejects short passwords", () => {
        expect(validateSignupPayload({ name: "Sam", email: "sam@example.com", password: "short", confirmPassword: "short" })).toMatch(/8 characters/);
    });

    test("rejects passwords that do not match", () => {
        expect(validateSignupPayload({ name: "Sam", email: "sam@example.com", password: "password123", confirmPassword: "password456" })).toMatch(/do not match/);
    });

    test("rejects passwords beyond bcrypt's byte limit", () => {
        const password = "a".repeat(73);
        expect(validateSignupPayload({ name: "Sam", email: "sam@example.com", password, confirmPassword: password })).toMatch(/72 UTF-8 bytes/);
    });

    test("rejects malformed login data", () => {
        expect(validateLoginPayload({ email: "not-an-email", password: "password123" })).toMatch(/valid email/);
    });

    test("rejects null request bodies", () => {
        expect(validateSignupPayload(null)).toMatch(/required/);
        expect(validateLoginPayload(null)).toMatch(/required/);
    });
});