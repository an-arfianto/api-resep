import { searchRecipesOR } from "../models/recipeModel.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

export async function findRecipes(req, res, next) {
	try {
		const { ingredients } = req.body;

		if (
			!ingredients ||
			!Array.isArray(ingredients) ||
			ingredients.length === 0
		) {
			return next(new ErrorResponse("ingredients harus array", 400));
		}

		// Normalize input (lowercase, trim)
		const normalized = ingredients.map((i) => i.toLowerCase().trim());

		const result = await searchRecipesOR(normalized);

		sendResponse(res, 200, {
			message: "Resep ditemukan!",
			count: result.length,
			data: result,
		});
	} catch (err) {
		next(new ErrorResponse(err.message, 500));
	}
}
