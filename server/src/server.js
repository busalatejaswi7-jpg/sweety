
import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");
const { default: pool } = await import("./config/db.js");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query("SELECT 1");

        const server = app.listen(PORT, () => {
            console.log(`Sweety API running on port ${PORT}`);
            console.log("PostgreSQL connected successfully.");
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Closing server...`);

            server.close(async () => {
                await pool.end();
                process.exit(0);
            });
        };

        process.once("SIGINT", () => shutdown("SIGINT"));
        process.once("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.error("Server startup failed:", error);
        await pool.end();
        process.exit(1);
    }
};

startServer();
