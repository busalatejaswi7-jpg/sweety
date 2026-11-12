import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";
import { validateLogin, validateSignup } from "../validators/auth.validator.js";

const router = Router();
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

export default router;