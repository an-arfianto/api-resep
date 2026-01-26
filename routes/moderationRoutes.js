import express from "express";
import ModerationController from "../controllers/moderationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import moderatorMiddleware from "../middlewares/moderatorMiddleware.js";

const router = express.Router();

// All moderation routes require authentication and moderator role
router.use(authMiddleware, moderatorMiddleware);

// Get moderation statistics
router.get("/stats", ModerationController.getStats);

// Get pending recipes
router.get("/pending", ModerationController.getPendingRecipes);

// Get recipes by status (query param: ?status=pending|approved|rejected)
router.get("/recipes", ModerationController.getRecipesByStatus);

// Get all recipes regardless of status
router.get("/recipes/all", ModerationController.getAllRecipes);

// Get specific recipe details (for moderation)
router.get("/recipes/:id", ModerationController.getRecipeDetails);

// Approve a recipe
router.put("/recipes/:id/approve", ModerationController.approveRecipe);

// Reject a recipe
router.put("/recipes/:id/reject", ModerationController.rejectRecipe);

export default router;
