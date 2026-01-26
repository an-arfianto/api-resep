import express from "express";
import ProfileController from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

// Get profile with stats
router.get("/", ProfileController.getProfile);

// Update profile (username)
router.put("/", ProfileController.updateProfile);

// Update password
router.put("/password", ProfileController.updatePassword);

export default router;
