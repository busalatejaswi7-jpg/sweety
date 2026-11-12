import { Router } from "express";
import {
  dailyReport,
  monthToDateReport,
  previousMonthReport,
} from "../controllers/report.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/daily", dailyReport);
router.get("/month-to-date", monthToDateReport);
router.get("/previous-month", previousMonthReport);

export default router;