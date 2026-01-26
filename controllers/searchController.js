import SearchModel from "../models/searchModel.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

/**
 * Search Controller
 * Handles all boolean search operations
 */
class SearchController {
    /**
     * Boolean search recipes
     */
    static async searchRecipes(req, res, next) {
        try {
            const { operator = "OR", ingredients, excludedIngredients = [] } = req.body;

            // Normalize ingredients (lowercase, trim, remove duplicates)
            const normalizedIngredients = [
                ...new Set(ingredients.map((i) => i.toLowerCase().trim())),
            ].filter(Boolean);

            const normalizedExcluded = [
                ...new Set(excludedIngredients.map((i) => i.toLowerCase().trim())),
            ].filter(Boolean);

            // Execute search
            const results = await SearchModel.booleanSearch({
                operator,
                ingredients: normalizedIngredients,
                excludedIngredients: normalizedExcluded,
            });

            sendResponse(res, 200, {
                message: `Resep ditemukan menggunakan operator ${operator}`,
                operator: operator.toUpperCase(),
                searchedIngredients: normalizedIngredients,
                excludedIngredients: normalizedExcluded.length > 0 ? normalizedExcluded : undefined,
                count: results.length,
                data: results,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }
}

export default SearchController;
