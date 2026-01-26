import express from "express";
import UserController from "../controllers/userController.js";
import { validateRequest, schemas } from "../utils/validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post(
	"/register",
	validateRequest(schemas.user),
	UserController.register,
);
router.post("/login", validateRequest(schemas.login), UserController.login);

// Protected routes
router.get("/me", authMiddleware, UserController.getCurrentUser);

export default router;
