import RecipeModel from "../models/recipeModel.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

class RecipeController {
    static async getAllRecipes(req, res, next) {
        try {
            const filters = {
                category: req.query.category,
                userId: req.query.userId,
            };

            const recipes = await RecipeModel.getAllRecipes(filters);

            sendResponse(res, 200, {
                message: "Semua resep berhasil diambil",
                count: recipes.length,
                data: recipes,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async getRecipeById(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const recipe = await RecipeModel.getRecipeById(recipeId);

            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ditemukan", 404));
            }

            sendResponse(res, 200, {
                message: "Resep berhasil diambil",
                data: recipe,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async getMyRecipes(req, res, next) {
        try {
            const userId = req.user.id;

            // Users can see all their own recipes regardless of status
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

    static async createRecipe(req, res, next) {
        try {
            const { name, category, description, instructions, ingredients } = req.body;

            // Parse ingredients with measurements
            const parsedIngredients = ingredients.map((item) => {
                if (typeof item === "object") {
                    return {
                        name: item.name.toLowerCase().trim(),
                        quantity: item.quantity || null,
                        unit: item.unit || null,
                    };
                } else {
                    // Parse string format: "500 g chicken"
                    const parts = item.trim().split(/\s+/);

                    if (parts.length >= 3) {
                        // "500 g chicken" -> quantity: 500, unit: g, name: chicken
                        return {
                            name: parts.slice(2).join(" ").toLowerCase().trim(),
                            quantity: parseFloat(parts[0]) || null,
                            unit: parts[1].toLowerCase().trim(),
                        };
                    } else if (parts.length === 2) {
                        // "500 chicken" or "chicken breast"
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
                        // Just ingredient name
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

    static async updateRecipe(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const { name, category, description, instructions, ingredients } = req.body;

            const isOwner = await RecipeModel.isRecipeOwner(recipeId, req.user.id);
            if (!isOwner) {
                return next(
                    new ErrorResponse("Resep tidak ditemukan atau tidak memiliki akses", 403),
                );
            }

            // Parse ingredients (same as create)
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
                return next(new ErrorResponse("Gagal mengupdate resep", 400));
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

    static async deleteRecipe(req, res, next) {
        try {
            const recipeId = req.recipeId;
            const deleted = await RecipeModel.deleteRecipe(recipeId, req.user.id);

            if (!deleted) {
                return next(
                    new ErrorResponse("Resep tidak ditemukan atau tidak memiliki akses", 403),
                );
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
