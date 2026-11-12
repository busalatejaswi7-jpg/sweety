import { Router } from "express";
import { listPatients, patientReport } from "../controllers/doctor.controller.js";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateToken, requireRole("doctor"));
router.get("/patients", listPatients);
router.get("/patients/:patientId/reports/:period", patientReport);

export default router;