import RecipeModel from "../models/recipeModel.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

class RecipeController {
    // semua resep
    static async getAllRecipes(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                userId: req.query.userId,
            };

            const recipes = await RecipeModel.getAllRecipes(filters);

            sendResponse(res, 200, {
                message: "Menampilkan semua resep",
                count: recipes.length,
                data: recipes,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    // resep id
    static async getRecipeById(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const recipe = await RecipeModel.getRecipeById(recipeId);

            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            sendResponse(res, 200, {
                message: "Menampilkan resep",
                data: recipe,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    // resep saya
    static async getMyRecipes(req, res, next) {
        try {
            const userId = req.user.id;

            const recipes = await RecipeModel.getAllRecipes({
                userId: userId,
                includeAll: true,
            });

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    // tambah resep
    static async createRecipe(req, res, next) {
        try {
            const { name, category, description, instructions, ingredients } = req.body;

            // parsing bahan dg takaran
            const parsedIngredients = ingredients.map((item) => {
                if (typeof item === "object") {
                    return {
                        name: item.name.toLowerCase().trim(),
                        quantity: item.quantity || null,
                        unit: item.unit || null,
                    };
                } else {
                    // parsing string format
                    const parts = item.trim().split(/\s+/);

                    if (parts.length >= 3) {
                        return {
                            name: parts.slice(2).join(" ").toLowerCase().trim(),
                            quantity: parseFloat(parts[0]) || null,
                            unit: parts[1].toLowerCase().trim(),
                        };
                    } else if (parts.length === 2) {
                        const maybeNumber = parseFloat(parts[0]);
                        if (!isNaN(maybeNumber)) {
                            return {
                                name: parts[1].toLowerCase().trim(),
                                quantity: maybeNumber,
                                unit: null,
                            };
                        } else {
                            return {
                                name: item.toLowerCase().trim(),
                                quantity: null,
                                unit: null,
                            };
                        }
                    } else {
                        return {
                            name: item.toLowerCase().trim(),
                            quantity: null,
                            unit: null,
                        };
                    }
                }
            });

            const recipeId = await RecipeModel.createRecipe(
                {
                    name,
                    category,
                    description,
                    instructions,
                    userId: req.user.id,
                },
                parsedIngredients,
            );

            const newRecipe = await RecipeModel.getRecipeById(recipeId);

            sendResponse(res, 201, {
                message: "Resep berhasil dibuat",
                data: newRecipe,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    // update resep
    static async updateRecipe(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const { name, category, description, instructions, ingredients } = req.body;

            const isOwner = await RecipeModel.isRecipeOwner(recipeId, req.user.id);
            if (!isOwner) {
                return next(new ErrorResponse("Resep tidak ditemukan/tidak memiliki akses", 403));
            }

            // parsing bahan dan takaran
            const parsedIngredients = ingredients
                ? ingredients.map((item) => {
                      if (typeof item === "object") {
                          return {
                              name: item.name.toLowerCase().trim(),
                              quantity: item.quantity || null,
                              unit: item.unit || null,
                          };
                      } else {
                          const parts = item.trim().split(/\s+/);
                          if (parts.length >= 3) {
                              return {
                                  name: parts.slice(2).join(" ").toLowerCase().trim(),
                                  quantity: parseFloat(parts[0]) || null,
                                  unit: parts[1].toLowerCase().trim(),
                              };
                          } else {
                              return {
                                  name: item.toLowerCase().trim(),
                                  quantity: null,
                                  unit: null,
                              };
                          }
                      }
                  })
                : null;

            const updated = await RecipeModel.updateRecipe(
                recipeId,
                { name, category, description, instructions },
                parsedIngredients,
                req.user.id,
            );

            if (!updated) {
                return next(new ErrorResponse("Resep gagal diupdate", 400));
            }

            const updatedRecipe = await RecipeModel.getRecipeById(recipeId);

            sendResponse(res, 200, {
                message: "Resep berhasil diupdate",
                data: updatedRecipe,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    // hapus resep
    static async deleteRecipe(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const deleted = await RecipeModel.deleteRecipe(recipeId, req.user.id);

            if (!deleted) {
                return next(new ErrorResponse("Resep tidak ditemukan/tidak memiliki akses", 403));
            }

            sendResponse(res, 200, {
                message: "Resep berhasil dihapus",
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }
}

export default RecipeController;
