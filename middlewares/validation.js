import ErrorResponse from "../utils/errorResponse.js";

/**
 * Validate recipe search request
 */
export function validateSearch(req, res, next) {
    const { operator, ingredients, excludedIngredients } = req.body;

    // Validate ingredients
    if (!ingredients) {
        return next(new ErrorResponse("Field 'ingredients' wajib diisi", 400));
    }

    if (!Array.isArray(ingredients)) {
        return next(new ErrorResponse("Field 'ingredients' harus berupa array", 400));
    }

    if (ingredients.length === 0) {
        return next(new ErrorResponse("Array 'ingredients' tidak boleh kosong", 400));
    }

    // Check if all ingredients are valid strings
    const invalidIngredients = ingredients.filter(
        (item) => typeof item !== "string" || item.trim() === "",
    );
    if (invalidIngredients.length > 0) {
        return next(
            new ErrorResponse("Semua ingredients harus berupa string yang tidak kosong", 400),
        );
    }

    // Validate operator
    const validOperators = ["AND", "OR", "NOT"];
    if (operator && !validOperators.includes(operator.toUpperCase())) {
        return next(new ErrorResponse(`Operator harus berupa ${validOperators.join(", ")}`, 400));
    }

    // Validate excludedIngredients for NOT operator
    if (operator && operator.toUpperCase() === "NOT") {
        if (!excludedIngredients || !Array.isArray(excludedIngredients)) {
            return next(
                new ErrorResponse(
                    "Operator NOT memerlukan 'excludedIngredients' sebagai array",
                    400,
                ),
            );
        }
        if (excludedIngredients.length === 0) {
            return next(new ErrorResponse("Array 'excludedIngredients' tidak boleh kosong", 400));
        }

        const invalidExcluded = excludedIngredients.filter(
            (item) => typeof item !== "string" || item.trim() === "",
        );
        if (invalidExcluded.length > 0) {
            return next(
                new ErrorResponse(
                    "Semua excludedIngredients harus berupa string yang tidak kosong",
                    400,
                ),
            );
        }
    }

    next();
}

/**
 * Validate recipe ID parameter
 */
export function validateRecipeId(req, res, next) {
    const recipeId = parseInt(req.params.id);

    if (isNaN(recipeId) || recipeId <= 0) {
        return next(new ErrorResponse("ID resep tidak valid", 400));
    }

    req.recipeId = recipeId;
    next();
}

/**
 * Validate recipe creation
 */
export function validateRecipeCreate(req, res, next) {
    const { name, category, description, instructions, ingredients } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
        return next(new ErrorResponse("Nama resep wajib diisi", 400));
    }

    // Validate category
    if (!category || typeof category !== "string" || category.trim() === "") {
        return next(new ErrorResponse("Kategori wajib diisi", 400));
    }

    // Validate instructions
    if (!instructions || typeof instructions !== "string" || instructions.trim() === "") {
        return next(new ErrorResponse("Instruksi wajib diisi", 400));
    }

    // Validate ingredients
    if (!ingredients || !Array.isArray(ingredients)) {
        return next(new ErrorResponse("Ingredients harus berupa array", 400));
    }

    if (ingredients.length === 0) {
        return next(new ErrorResponse("Ingredients tidak boleh kosong", 400));
    }

    // FIXED: Accept both string and object format
    const invalidIngredients = ingredients.filter((item) => {
        // If it's an object
        if (typeof item === "object" && item !== null) {
            return !item.name || typeof item.name !== "string" || item.name.trim() === "";
        }
        // If it's a string
        return typeof item !== "string" || item.trim() === "";
    });

    if (invalidIngredients.length > 0) {
        return next(new ErrorResponse("Ingredients tidak valid", 400));
    }

    next();
}
