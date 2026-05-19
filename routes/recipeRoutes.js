import express from "express";
import RecipeController from "../controllers/recipeController.js";
import { validateRecipeId, validateRecipeCreate } from "../middlewares/validation.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import suspendMiddleware from "../middlewares/suspendMiddleware.js";

const router = express.Router();

router.get("/", RecipeController.showAllRecipes);
router.get("/my", authMiddleware, suspendMiddleware, RecipeController.showMyRecipes);
router.get("/:id", validateRecipeId, RecipeController.showRecipe);

router.get(
    "/:id/edit",
    authMiddleware,
    suspendMiddleware,
    validateRecipeId,
    RecipeController.showMyRecipe,
);
router.post(
    "/",
    authMiddleware,
    suspendMiddleware,
    validateRecipeCreate,
    RecipeController.createRecipe,
);
router.put(
    "/:id",
    authMiddleware,
    suspendMiddleware,
    validateRecipeId,
    validateRecipeCreate,
    RecipeController.updateRecipe,
);
router.delete(
    "/:id",
    authMiddleware,
    suspendMiddleware,
    validateRecipeId,
    RecipeController.deleteRecipe,
);

export default router;
