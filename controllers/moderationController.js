import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ModerationController {
    /**
     * Get all pending recipes
     */
    static async getPendingRecipes(req, res, next) {
        try {
            const recipes = await RecipeModel.getRecipesByStatus("pending");

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all recipes by status
     */
    static async getRecipesByStatus(req, res, next) {
        try {
            const { status } = req.query;

            if (!status || !["pending", "approved", "rejected"].includes(status)) {
                return next(
                    new ErrorResponse("Invalid status. Use: pending, approved, or rejected", 400),
                );
            }

            const recipes = await RecipeModel.getRecipesByStatus(status);

            res.status(200).json({
                success: true,
                status,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all recipes (including all statuses)
     */
    static async getAllRecipes(req, res, next) {
        try {
            const recipes = await RecipeModel.getAllRecipes({ includeAll: true });

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve a recipe
     */
    static async approveRecipe(req, res, next) {
        try {
            const { id } = req.params;
            const moderatorId = req.user.id;

            // Check if recipe exists
            const recipeExists = await RecipeModel.recipeExists(id);
            if (!recipeExists) {
                return next(new ErrorResponse("Recipe not found", 404));
            }

            // Get recipe details to check current status
            const recipe = await RecipeModel.getRecipeById(id, true);

            if (recipe.status === "approved") {
                return next(new ErrorResponse("Recipe is already approved", 400));
            }

            // Approve the recipe
            const success = await RecipeModel.approveRecipe(id, moderatorId);

            if (!success) {
                return next(new ErrorResponse("Failed to approve recipe", 500));
            }

            // Get updated recipe
            const updatedRecipe = await RecipeModel.getRecipeById(id, true);

            res.status(200).json({
                success: true,
                message: "Recipe approved successfully",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject a recipe
     */
    static async rejectRecipe(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const moderatorId = req.user.id;

            // Check if recipe exists
            const recipeExists = await RecipeModel.recipeExists(id);
            if (!recipeExists) {
                return next(new ErrorResponse("Recipe not found", 404));
            }

            // Get recipe details to check current status
            const recipe = await RecipeModel.getRecipeById(id, true);

            if (recipe.status === "rejected") {
                return next(new ErrorResponse("Recipe is already rejected", 400));
            }

            // Reject the recipe
            const success = await RecipeModel.rejectRecipe(id, moderatorId, reason || null);

            if (!success) {
                return next(new ErrorResponse("Failed to reject recipe", 500));
            }

            // Get updated recipe
            const updatedRecipe = await RecipeModel.getRecipeById(id, true);

            res.status(200).json({
                success: true,
                message: "Recipe rejected successfully",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get moderation statistics
     */
    static async getStats(req, res, next) {
        try {
            const stats = await RecipeModel.getModerationStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get recipe details for moderation (includes all fields)
     */
    static async getRecipeDetails(req, res, next) {
        try {
            const { id } = req.params;

            const recipe = await RecipeModel.getRecipeById(id, true);

            if (!recipe) {
                return next(new ErrorResponse("Recipe not found", 404));
            }

            res.status(200).json({
                success: true,
                data: recipe,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ModerationController;
