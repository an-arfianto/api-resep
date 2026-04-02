import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import { sendResponse } from "../utils/sendResponse.js";

function parseIngredient(item) {
    return {
        name: item.name.toLowerCase().trim(),
        quantity: item.quantity || null,
        unit: item.unit || null,
    };
}

class RecipeController {
    static async showAllRecipes(req, res, next) {
        try {
            const recipes = await RecipeModel.showAllRecipes({
                category: req.query.category,
                userId: req.query.userId,
            });

            sendResponse(res, 200, {
                message: "Menampilkan semua resep",
                count: recipes.length,
                data: recipes,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async showRecipe(req, res, next) {
        try {
            const recipe = await RecipeModel.showRecipe(req.recipeId);
            if (!recipe) return next(new ErrorResponse("Resep tidak ada", 404));

            sendResponse(res, 200, { message: "Menampilkan resep", data: recipe });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async showMyRecipes(req, res, next) {
        try {
            const recipes = await RecipeModel.showAllRecipes({
                userId: req.user.id,
                includeAll: true,
            });

            sendResponse(res, 200, {
                message: "Menampilkan resep saya",
                count: recipes.length,
                data: recipes,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async createRecipe(req, res, next) {
        try {
            const { name, category, description, instructions, ingredients } = req.body;

            const recipeId = await RecipeModel.createRecipe(
                { name, category, description, instructions, userId: req.user.id },
                ingredients.map(parseIngredient),
            );

            const newRecipe = await RecipeModel.showRecipe(recipeId);
            sendResponse(res, 201, { message: "Resep berhasil dibuat", data: newRecipe });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async updateRecipe(req, res, next) {
        try {
            const { name, category, description, instructions, ingredients } = req.body;

            const isOwner = await RecipeModel.recipeOwner(req.recipeId, req.user.id);
            if (!isOwner)
                return next(new ErrorResponse("Resep tidak ditemukan/tidak memiliki akses", 403));

            const updated = await RecipeModel.updateRecipe(
                req.recipeId,
                { name, category, description, instructions },
                ingredients ? ingredients.map(parseIngredient) : null,
                req.user.id,
            );

            if (!updated) return next(new ErrorResponse("Resep gagal diupdate", 400));

            const updatedRecipe = await RecipeModel.showRecipe(req.recipeId);
            sendResponse(res, 200, { message: "Resep berhasil diupdate", data: updatedRecipe });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async deleteRecipe(req, res, next) {
        try {
            const isOwner = await RecipeModel.recipeOwner(req.recipeId, req.user.id);
            if (!isOwner)
                return next(new ErrorResponse("Resep tidak ditemukan/tidak memiliki akses", 403));

            await RecipeModel.deleteRecipe(req.recipeId, req.user.id);
            sendResponse(res, 200, { message: "Resep berhasil dihapus" });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }
}

export default RecipeController;
