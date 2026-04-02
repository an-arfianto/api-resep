import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateLogin, validateRegister } from "../middlewares/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, UserController.register);
router.post("/login", validateLogin, UserController.login);

// Protected routes
router.get("/me", authMiddleware, UserController.showUser);

export default router;
