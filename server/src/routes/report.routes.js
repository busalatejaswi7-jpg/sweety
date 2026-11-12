import { Router } from "express";
import {
  dailyReport,
  monthToDateReport,
  previousMonthReport,
} from "../controllers/report.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken, requireRole("patient"));

router.get("/daily", dailyReport);
router.get("/month-to-date", monthToDateReport);
router.get("/previous-month", previousMonthReport);

export default router;