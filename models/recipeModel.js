import db from "../config/database.js";

const recipeList = `
    SELECT r.id, r.name, r.category,
        r.description, r.instructions,
        r.status, r.reviewed_by, r.reviewed_at,
        r.rejection_reason, r.created_at, r.user_id,
        u.username as creator_username,
        reviewer.username as reviewer_username,
        GROUP_CONCAT(
            DISTINCT CONCAT_WS(' ',
                NULLIF(TRIM(i.quantity), ''),
                NULLIF(TRIM(i.unit), ''),
                i.ingredient
            ) ORDER BY i.ingredient
            SEPARATOR ', '
        ) AS ingredients
    FROM recipes r
    LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
`;

const recipeGroup = `
    GROUP BY r.id, r.name, r.category, r.description, r.instructions,
        r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason,
        r.created_at, r.user_id, u.username, reviewer.username
`;

class RecipeModel {
    static async showAllRecipes(filters = {}) {
        let sql = recipeList + " WHERE 1=1";
        const params = [];

        if (filters.status) {
            sql += " AND r.status = ?";
            params.push(filters.status);
        } else if (!filters.includeAll) {
            sql += " AND r.status = 'approved'";
        }

        if (filters.category) {
            sql += " AND r.category = ?";
            params.push(filters.category);
        }

        if (filters.userId) {
            sql += " AND r.user_id = ?";
            params.push(filters.userId);
        }

        sql += recipeGroup + " ORDER BY r.created_at DESC";
        return db(sql, params);
    }

    static async showRecipe(recipeId, includeAll = false) {
        let sql = `
            SELECT r.id, r.name, r.category,
                r.description, r.instructions, r.status,
                r.reviewed_by, r.reviewed_at, r.rejection_reason,
                r.user_id, r.created_at,
                u.username as creator_username,
                reviewer.username as reviewer_username
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
            WHERE r.id = ?
        `;
        const params = [recipeId];

        if (!includeAll) {
            sql += " AND r.status = 'approved'";
        }

        const recipeRows = await db(sql, params);
        if (!recipeRows.length) return null;

        const recipe = recipeRows[0];
        const ingredients = await db(
            "SELECT ingredient, quantity, unit FROM recipe_ingredients WHERE recipe_id = ? ORDER BY ingredient",
            [recipeId],
        );

        recipe.ingredients = ingredients.map((i) => ({
            name: i.ingredient,
            quantity: i.quantity,
            unit: i.unit,
            display: [i.quantity, i.unit, i.ingredient].filter(Boolean).join(" "),
        }));

        return recipe;
    }

    static async createRecipe(recipeData, ingredientsList) {
        const result = await db(
            "INSERT INTO recipes (name, category, description, instructions, user_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [
                recipeData.name,
                recipeData.category,
                recipeData.description,
                recipeData.instructions,
                recipeData.userId,
            ],
        );

        const recipeId = result.insertId;

        if (ingredientsList?.length) {
            const placeholders = ingredientsList.map(() => "(?, ?, ?, ?)").join(", ");
            const values = ingredientsList.flatMap((i) => [
                recipeId,
                i.name,
                i.quantity ?? null,
                i.unit ?? null,
            ]);
            await db(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES ${placeholders}`,
                values,
            );
        }

        return recipeId;
    }

    static async updateRecipe(recipeId, recipeData, ingredientsList, userId) {
        const sql = `
            UPDATE recipes
            SET name = ?, category = ?, description = ?, instructions = ?,
                status = 'pending', reviewed_by = NULL, reviewed_at = NULL, rejection_reason = NULL
            WHERE id = ? AND user_id = ?
        `;
        const result = await db(sql, [
            recipeData.name,
            recipeData.category,
            recipeData.description,
            recipeData.instructions,
            recipeId,
            userId,
        ]);

        if (!result.affectedRows) return false;

        if (ingredientsList?.length) {
            await db("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipeId]);
            const placeholders = ingredientsList.map(() => "(?, ?, ?, ?)").join(", ");
            const values = ingredientsList.flatMap((i) => [
                recipeId,
                i.name,
                i.quantity ?? null,
                i.unit ?? null,
            ]);
            await db(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES ${placeholders}`,
                values,
            );
        }

        return true;
    }

    static async deleteRecipe(recipeId, userId) {
        const result = await db("DELETE FROM recipes WHERE id = ? AND user_id = ?", [
            recipeId,
            userId,
        ]);
        return result.affectedRows > 0;
    }

    static async recipeExists(recipeId) {
        const rows = await db("SELECT id FROM recipes WHERE id = ?", [recipeId]);
        return rows.length > 0;
    }

    static async recipeOwner(recipeId, userId) {
        const rows = await db("SELECT id FROM recipes WHERE id = ? AND user_id = ?", [
            recipeId,
            userId,
        ]);
        return rows.length > 0;
    }

    static async showRecipeStatus(status) {
        return this.showAllRecipes({ status, includeAll: true });
    }
}

export default RecipeModel;
