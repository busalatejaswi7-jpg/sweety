const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BCRYPT_PASSWORD_BYTES = 72;

function isValidEmail(email) {
    const normalizedEmail = email.trim();
    return normalizedEmail.length <= 255 && emailPattern.test(normalizedEmail);
}

function passwordError(password) {
    if (Array.from(password).length < 8) {
        return "Password must contain at least 8 characters.";
    }
    if (Buffer.byteLength(password, "utf8") > MAX_BCRYPT_PASSWORD_BYTES) {
        return "Password must not exceed 72 UTF-8 bytes.";
    }
    return null;
}

export function validateSignupPayload(body = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Name, email and password are required.";
    }
    const { name, email, password, confirmPassword } = body;
    const accountType = body.accountType ?? "patient";
    if (typeof name !== "string" || typeof email !== "string" ||
        typeof password !== "string" || typeof confirmPassword !== "string") {
        return "Name, email and password are required.";
    }
    if (!name.trim() || name.trim().length > 100) return "Name must contain 1 to 100 characters.";
    if (!isValidEmail(email)) return "Please enter a valid email.";
    const passwordValidationError = passwordError(password);
    if (passwordValidationError) return passwordValidationError;
    if (password !== confirmPassword) return "Passwords do not match.";
    if (accountType !== "patient" && accountType !== "doctor") {
        return "Account type must be patient or doctor.";
    }
    return null;
}

export function validateLoginPayload(body = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "A valid email and password are required.";
    }
    if (typeof body.email !== "string" || !isValidEmail(body.email) ||
        typeof body.password !== "string" || !body.password) {
        return "A valid email and password are required.";
    }
    const passwordValidationError = passwordError(body.password);
    if (passwordValidationError) return passwordValidationError;
    return null;
}

export function validateSignup(req, res, next) {
    const error = validateSignupPayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    return next();
}

export function validateLogin(req, res, next) {
    const error = validateLoginPayload(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    return next();
}