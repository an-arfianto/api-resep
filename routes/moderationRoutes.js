import express from "express";
import ModerationController from "../controllers/moderationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import moderatorMiddleware from "../middlewares/moderatorMiddleware.js";

const router = express.Router();

// route hanya dapat diakses oleh moderator saja
router.use(authMiddleware, moderatorMiddleware);

// moderator statistik
router.get("/stats", ModerationController.getStats);

// resep management
router.get("/pending", ModerationController.getPendingRecipes);
router.get("/recipes", ModerationController.getRecipesByStatus);
router.get("/recipes/all", ModerationController.getAllRecipes);
router.get("/recipes/:id", ModerationController.getRecipeDetails);
router.put("/recipes/:id/approve", ModerationController.approveRecipe);
router.put("/recipes/:id/reject", ModerationController.rejectRecipe);

export default router;
