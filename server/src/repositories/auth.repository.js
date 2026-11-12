import pool from "../config/db.js";

export async function findUserByEmail(email) {
    const result = await pool.query(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role }) {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        [name, email, passwordHash, role]
    );
    return result.rows[0];
}