import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ModerationController {
    // semua pending resep
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

    // resep status
    static async getRecipesByStatus(req, res, next) {
        try {
            const { status } = req.query;

            if (!status || !["pending", "approved", "rejected"].includes(status)) {
                return next(new ErrorResponse("Status invalid", 400));
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

    // semua resep
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

    // resep yg disetujui
    static async approveRecipe(req, res, next) {
        try {
            const { id } = req.params;
            const moderatorId = req.user.id;
            const recipeExists = await RecipeModel.recipeExists(id);
            if (!recipeExists) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            const recipe = await RecipeModel.getRecipeById(id, true);
            if (recipe.status === "approved") {
                return next(new ErrorResponse("Resep sudah disetujui", 400));
            }

            if (recipe.user_id === req.user.id) {
                return next(new ErrorResponse("Anda tidak bisa mereview resep anda sendiri", 400));
            }

            // resep disetujui
            const success = await RecipeModel.approveRecipe(id, moderatorId);
            if (!success) {
                return next(new ErrorResponse("Resep gagal disetujui", 500));
            }

            const updatedRecipe = await RecipeModel.getRecipeById(id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil disetujui",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    // resep yg ditolak
    static async rejectRecipe(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const moderatorId = req.user.id;
            const recipeExists = await RecipeModel.recipeExists(id);
            if (!recipeExists) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            const recipe = await RecipeModel.getRecipeById(id, true);
            if (recipe.status === "rejected") {
                return next(new ErrorResponse("Resep sudah ditolak", 400));
            }

            if (recipe.user_id === req.user.id) {
                return next(new ErrorResponse("Anda tidak bisa mereview resep anda sendiri", 400));
            }

            // resep ditolak
            const success = await RecipeModel.rejectRecipe(id, moderatorId, reason || null);

            if (!success) {
                return next(new ErrorResponse("Resep gagal ditolak", 500));
            }

            const updatedRecipe = await RecipeModel.getRecipeById(id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil ditolak",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    // mod stats
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

    // resep detail
    static async getRecipeDetails(req, res, next) {
        try {
            const { id } = req.params;

            const recipe = await RecipeModel.getRecipeById(id, true);

            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ada", 404));
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
