import express from "express";
import RecipeController from "../controllers/recipeController.js";
import { validateRecipeId, validateRecipeCreate } from "../middlewares/validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", RecipeController.getAllRecipes);

// Protected routes that must come BEFORE /:id
router.get("/my", authMiddleware, RecipeController.getMyRecipes);

// /:id route - this should come AFTER /my to avoid conflicts
router.get("/:id", validateRecipeId, RecipeController.getRecipeById);

// Other protected routes
router.post("/", authMiddleware, validateRecipeCreate, RecipeController.createRecipe);
router.put(
    "/:id",
    authMiddleware,
    validateRecipeId,
    validateRecipeCreate,
    RecipeController.updateRecipe,
);
router.delete("/:id", authMiddleware, validateRecipeId, RecipeController.deleteRecipe);

export default router;
