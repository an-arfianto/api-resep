import express from "express";
import UserController from "../controllers/userController.js";
import { validateRequest, schema } from "../utils/validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateRequest(schema.user), UserController.register);
router.post("/login", validateRequest(schema.login), UserController.login);

// Protected routes
router.get("/me", authMiddleware, UserController.getCurrentUser);

export default router;
