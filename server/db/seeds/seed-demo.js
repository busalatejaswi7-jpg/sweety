import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const { default: pool } = await import("../../src/config/db.js");

const demoName = process.env.DEMO_USER_NAME?.trim() || "Sweety Demo";
const demoEmail = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
const demoPassword = process.env.DEMO_USER_PASSWORD;

async function seedDemo() {
    if (process.env.NODE_ENV === "production") {
        throw new Error("The demo seed cannot run in production.");
    }
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required.");
    }
    if (!demoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demoEmail)) {
        throw new Error("Set a valid DEMO_USER_EMAIL in server/.env.");
    }
    if (!demoPassword || Array.from(demoPassword).length < 8) {
        throw new Error("Set DEMO_USER_PASSWORD to at least 8 characters in server/.env.");
    }
    if (Buffer.byteLength(demoPassword, "utf8") > 72) {
        throw new Error("DEMO_USER_PASSWORD must not exceed 72 UTF-8 bytes.");
    }

    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        let result = await client.query(
            "SELECT id, role FROM users WHERE lower(email) = $1 FOR UPDATE",
            [demoEmail]
        );
        let user = result.rows[0];

        if (!user) {
            const passwordHash = await bcrypt.hash(demoPassword, 12);
            result = await client.query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, $3, 'patient')
                 ON CONFLICT (email) DO NOTHING
                 RETURNING id, role`,
                [demoName, demoEmail, passwordHash]
            );
            user = result.rows[0];

            if (!user) {
                result = await client.query(
                    "SELECT id, role FROM users WHERE lower(email) = $1 FOR UPDATE",
                    [demoEmail]
                );
                user = result.rows[0];
            }
        }

        if (!user || user.role !== "patient") {
            throw new Error("The configured demo email belongs to a non-patient account.");
        }

        const readings = [
            { daysAgo: 0, slot: "Morning fasting", value: 104 },
            { daysAgo: 0, slot: "After breakfast", value: 137 },
            { daysAgo: 0, slot: "After lunch", value: 129 },
            { daysAgo: 0, slot: "After dinner", value: 117 },
            { daysAgo: 1, slot: "Morning fasting", value: 101 },
            { daysAgo: 1, slot: "After breakfast", value: 141 },
            { daysAgo: 1, slot: "After lunch", value: 132 },
            { daysAgo: 1, slot: "After dinner", value: 120 },
            { daysAgo: 2, slot: "Morning fasting", value: 99 },
            { daysAgo: 2, slot: "After breakfast", value: 135 },
            { daysAgo: 2, slot: "After lunch", value: 125 },
            { daysAgo: 2, slot: "After dinner", value: 114 },
        ];

        for (const reading of readings) {
            await client.query(
                `INSERT INTO readings (user_id, reading_date, slot, value)
                 VALUES ($1, CURRENT_DATE - $2::integer, $3, $4)
                 ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
                [user.id, reading.daysAgo, reading.slot, reading.value]
            );
        }

        await client.query("COMMIT");
        transactionStarted = false;
        console.log("Demo patient and sample readings are ready.");
        console.log(`Demo email: ${demoEmail}`);
        console.log("Existing account passwords and readings were left unchanged.");
    } catch (error) {
        if (transactionStarted) await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seedDemo().catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
});
