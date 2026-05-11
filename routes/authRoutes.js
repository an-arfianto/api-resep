import express from "express";
import AuthController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateLogin, validateRegister } from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);

// Protected routes
router.get("/me", authMiddleware, AuthController.me);

export default router;
