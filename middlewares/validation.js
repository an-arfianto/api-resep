import ErrorResponse from "../utils/errorResponse.js";

const stringCheck = (string) => typeof string === "string" && string.trim() !== "";

export function validateRegister(req, res, next) {
    const { username, password, role_id } = req.body;

    if (!stringCheck(username)) return next(new ErrorResponse("Username tidak boleh kosong", 400));
    if (username.length < 3 || username.length > 50)
        return next(new ErrorResponse("Username minimal 3-50 karakter", 400));
    if (!stringCheck(password)) return next(new ErrorResponse("Password tidak boleh kosong", 400));
    if (password.length < 6) return next(new ErrorResponse("Password minimal 6 karakter", 400));
    if (!role_id || !Number.isInteger(Number(role_id)) || Number(role_id) <= 0)
        return next(new ErrorResponse("Role ID harus berupa angka positif", 400));

    next();
}

export function validateLogin(req, res, next) {
    const { username, password } = req.body;

    if (!stringCheck(username)) return next(new ErrorResponse("Username tidak boleh kosong", 400));
    if (!stringCheck(password)) return next(new ErrorResponse("Password tidak boleh kosong", 400));

    next();
}

export function validateRecipeId(req, res, next) {
    const recipeId = parseInt(req.params.id);

    if (isNaN(recipeId) || recipeId <= 0) return next(new ErrorResponse("ID resep tidak valid", 400));

    req.recipeId = recipeId;
    next();
}

export function validateRecipeCreate(req, res, next) {
    const { name, category, instructions, ingredients } = req.body;

    if (!stringCheck(name)) return next(new ErrorResponse("Nama resep wajib diisi", 400));
    if (!stringCheck(category)) return next(new ErrorResponse("Kategori wajib diisi", 400));
    if (!stringCheck(instructions)) return next(new ErrorResponse("Instruksi wajib diisi", 400));
    if (!Array.isArray(ingredients) || ingredients.length === 0)
        return next(new ErrorResponse("Bahan tidak boleh kosong", 400));

    const hasInvalidIngredient = ingredients.some((item) => !item?.name || !stringCheck(item.name));
    if (hasInvalidIngredient) return next(new ErrorResponse("Bahan tidak valid", 400));

    next();
}

export function validateSearch(req, res, next) {
    const { operator, ingredients, excludedIngredients } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0)
        return next(new ErrorResponse("Data 'ingredients' wajib diisi sebagai array", 400));

    const hasInvalidIngredient = ingredients.some((item) => !stringCheck(item));
    if (hasInvalidIngredient)
        return next(new ErrorResponse("Semua 'ingredients' harus berupa string yang tidak kosong", 400));

    const validOperators = ["AND", "OR", "NOT"];
    if (operator && !validOperators.includes(operator.toUpperCase()))
        return next(new ErrorResponse(`Operator harus berupa ${validOperators.join(", ")}`, 400));

    if (operator?.toUpperCase() === "NOT") {
        if (!Array.isArray(excludedIngredients) || excludedIngredients.length === 0)
            return next(new ErrorResponse("Operator NOT memerlukan 'excludedIngredients' yang tidak kosong", 400));

        const hasInvalidExcluded = excludedIngredients.some((item) => !stringCheck(item));
        if (hasInvalidExcluded)
            return next(new ErrorResponse("Semua 'excludedIngredients' harus berupa string yang tidak kosong", 400));
    }

    next();
}
