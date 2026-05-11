import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ModController {
    static async showPending(req, res, next) {
        try {
            const recipes = await RecipeModel.showRecipeStatus("pending");

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    static async showRecipeStatus(req, res, next) {
        try {
            if (!req.query.status || !["pending", "approved", "rejected"].includes(req.query.status)) {
                return next(new ErrorResponse("Status invalid", 400));
            }

            const recipes = await RecipeModel.showRecipeStatus(req.query.status);

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

    static async showAllRecipes(req, res, next) {
        try {
            const recipes = await RecipeModel.showAllRecipes({ includeAll: true });

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    static async approveRecipe(req, res, next) {
        try {
            const recipeExists = await RecipeModel.recipeExists(req.params.id);
            if (!recipeExists) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            const recipe = await RecipeModel.showRecipe(req.params.id, true);
            if (recipe.status === "approved") {
                return next(new ErrorResponse("Resep sudah disetujui", 400));
            }

            if (recipe.user_id === req.user.id) {
                return next(new ErrorResponse("Anda tidak bisa mereview resep anda sendiri", 400));
            }

            const success = await RecipeModel.approveRecipe(req.params.id, req.user.id);
            if (!success) {
                return next(new ErrorResponse("Resep gagal disetujui", 500));
            }

            const updatedRecipe = await RecipeModel.showRecipe(req.params.id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil disetujui",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    static async rejectRecipe(req, res, next) {
        try {
            const recipeExists = await RecipeModel.recipeExists(req.params.id);
            if (!recipeExists) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            const recipe = await RecipeModel.showRecipe(req.params.id, true);
            if (recipe.status === "rejected") {
                return next(new ErrorResponse("Resep sudah ditolak", 400));
            }

            if (recipe.user_id === req.user.id) {
                return next(new ErrorResponse("Anda tidak bisa mereview resep anda sendiri", 400));
            }

            const success = await RecipeModel.rejectRecipe(req.params.id, req.user.id, req.body.reason || null);

            if (!success) {
                return next(new ErrorResponse("Resep gagal ditolak", 500));
            }

            const updatedRecipe = await RecipeModel.showRecipe(req.params.id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil ditolak",
                data: updatedRecipe,
            });
        } catch (error) {
            next(error);
        }
    }

    static async showStats(req, res, next) {
        try {
            const stats = await RecipeModel.showModStats();

            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    static async showRecipeDetail(req, res, next) {
        try {
            const recipe = await RecipeModel.showRecipe(req.params.id, true);

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

export default ModController;
