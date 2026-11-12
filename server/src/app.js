
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import reportRoutes from "./routes/report.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5174");
}

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/doctor", doctorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(errorHandler);

export default app;
