import express from "express";
import AdminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// User management
router.get("/users", AdminController.getAllUsers);
router.put("/users/:id/promote", AdminController.promoteToModerator);
router.delete("/users/:id", AdminController.deleteUser);

// Recipe management
router.get("/recipes", AdminController.getAllRecipes);
router.delete("/recipes/:id", AdminController.deleteRecipe);

// Statistics
router.get("/stats", AdminController.getStats);

router.put("/users/:id/demote", AdminController.demoteToUser);

export default router;
