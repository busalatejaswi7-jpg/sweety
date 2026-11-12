import { Router } from "express";
import {
  addReading,
  getDailyReadings,
  editReading,
  removeReading,
} from "../controllers/reading.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken, requireRole("patient"));

router.post("/", addReading);
router.get("/", getDailyReadings);
router.put("/:id", editReading);
router.delete("/:id", removeReading);

export default router;