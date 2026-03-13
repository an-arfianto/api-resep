import express from "express";
import AdminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

// route hanya dapat diakses oleh admin saja
router.use(authMiddleware, adminMiddleware);

// user management
router.get("/users", AdminController.getAllUsers);
router.put("/users/:id/promote", AdminController.promoteToModerator);
router.put("/users/:id/demote", AdminController.demoteToUser);
router.delete("/users/:id", AdminController.deleteUser);

// resep management
router.get("/recipes", AdminController.getAllRecipes);
router.delete("/recipes/:id", AdminController.deleteRecipe);

// statistik
router.get("/stats", AdminController.getStats);

export default router;
