import { Router } from "express";
import {
  addReading,
  getDailyReadings,
  editReading,
  removeReading,
} from "../controllers/reading.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post("/", addReading);
router.get("/", getDailyReadings);
router.put("/:id", editReading);
router.delete("/:id", removeReading);

export default router;