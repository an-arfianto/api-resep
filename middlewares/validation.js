import ErrorResponse from "../utils/errorResponse.js";

// validasi data pencarian
export function validateSearch(req, res, next) {
    const { operator, ingredients, excludedIngredients } = req.body;

    if (!ingredients) {
        return next(new ErrorResponse("Data 'ingredients' wajib diisi", 400));
    }

    if (!Array.isArray(ingredients)) {
        return next(new ErrorResponse("Data 'ingredients' harus berupa array", 400));
    }

    if (ingredients.length === 0) {
        return next(new ErrorResponse("Array 'ingredients' tidak boleh kosong", 400));
    }

    const invalidIngredients = ingredients.filter(
        (item) => typeof item !== "string" || item.trim() === "",
    );
    if (invalidIngredients.length > 0) {
        return next(
            new ErrorResponse("Semua 'ingredients' harus berupa string yang tidak kosong", 400),
        );
    }

    const validOperators = ["AND", "OR", "NOT"];
    if (operator && !validOperators.includes(operator.toUpperCase())) {
        return next(new ErrorResponse(`Operator harus berupa ${validOperators.join(", ")}`, 400));
    }

    if (operator && operator.toUpperCase() === "NOT") {
        if (!excludedIngredients || !Array.isArray(excludedIngredients)) {
            return next(
                new ErrorResponse(
                    "Operator NOT memerlukan 'excludedIngredients' berbentuk array",
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
                    "Semua 'excludedIngredients' harus berupa string yang tidak kosong",
                    400,
                ),
            );
        }
    }

    next();
}

// validasi resep id
export function validateRecipeId(req, res, next) {
    const recipeId = parseInt(req.params.id);

    if (isNaN(recipeId) || recipeId <= 0) {
        return next(new ErrorResponse("ID resep tidak valid", 400));
    }

    req.recipeId = recipeId;
    next();
}

// validasi pembuatan resep
export function validateRecipeCreate(req, res, next) {
    const { name, category, description, instructions, ingredients } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return next(new ErrorResponse("Nama resep wajib diisi", 400));
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
        return next(new ErrorResponse("Kategori wajib diisi", 400));
    }

    if (!instructions || typeof instructions !== "string" || instructions.trim() === "") {
        return next(new ErrorResponse("Instruksi wajib diisi", 400));
    }

    if (!ingredients || !Array.isArray(ingredients)) {
        return next(new ErrorResponse("Bahan harus berupa array", 400));
    }

    if (ingredients.length === 0) {
        return next(new ErrorResponse("Bahan tidak boleh kosong", 400));
    }

    // validasi bahan dari string/array object
    const invalidIngredients = ingredients.filter((item) => {
        if (typeof item === "object" && item !== null) {
            return !item.name || typeof item.name !== "string" || item.name.trim() === "";
        }
        return typeof item !== "string" || item.trim() === "";
    });

    if (invalidIngredients.length > 0) {
        return next(new ErrorResponse("Bahan tidak valid", 400));
    }

    next();
}
