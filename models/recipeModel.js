import db from "../config/database.js";

class RecipeModel {
    /*
     * Get semua resep
     */
    static async getAllRecipes(filters = {}) {
        let sql = `
            SELECT r.id, r.name, r.category,
                r.description, r.instructions,  /* ADD THIS LINE */
                r.status, r.reviewed_by, r.reviewed_at,
                r.rejection_reason, r.created_at, r.user_id,
                u.username as creator_username,
                reviewer.username as reviewer_username,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        IFNULL(i.quantity, ''), 
                        ' ', 
                        IFNULL(i.unit, ''), 
                        ' ', 
                        i.ingredient
                    ) 
                    ORDER BY i.ingredient 
                    SEPARATOR ', '
                ) AS ingredients
            FROM recipes r 
            LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
            WHERE 1=1
        `;
        const params = [];

        // Filter by status (default: only approved for regular users)
        if (filters.status) {
            sql += " AND r.status = ?";
            params.push(filters.status);
        } else if (!filters.includeAll) {
            // Only show approved recipes unless specifically requesting all
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

        sql += `
			GROUP BY r.id, r.name, r.category, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.user_id, u.username, reviewer.username
			ORDER BY r.created_at DESC
		`;

        const rows = await db(sql, params);
        return rows;
    }

    /*
     * Get resep ID
     */
    static async getRecipeById(recipeId, includeStatus = false) {
        // First get recipe details
        const recipeSql = `
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

        const recipeRows = await db(recipeSql, [recipeId]);

        if (recipeRows.length === 0) {
            return null;
        }

        const recipe = recipeRows[0];

        // Get ingredients with measurements
        const ingredientsSql = `
			SELECT ingredient, quantity, unit
			FROM recipe_ingredients
			WHERE recipe_id = ?
			ORDER BY ingredient
		`;

        const ingredients = await db(ingredientsSql, [recipeId]);

        // Format ingredients for display
        recipe.ingredients = ingredients.map((i) => ({
            name: i.ingredient,
            quantity: i.quantity,
            unit: i.unit,
            display:
                `${i.quantity ? i.quantity : ""} ${i.unit ? i.unit : ""} ${i.ingredient}`.trim(),
        }));

        // Also provide as string for compatibility
        recipe.ingredientsText = ingredients
            .map((i) =>
                `${i.quantity ? i.quantity : ""} ${i.unit ? i.unit : ""} ${i.ingredient}`.trim(),
            )
            .join(", ");

        return recipe;
    }

    /*
     * Tambah resep
     */
    static async createRecipe(recipeData, ingredientsList) {
        // tambah resep dengan 'pending' status secara default
        const recipeSql = `
			INSERT INTO recipes (name, category, description, instructions, user_id, status)
			VALUES (?, ?, ?, ?, ?, 'pending')
		`;
        const recipeResult = await db(recipeSql, [
            recipeData.name,
            recipeData.category,
            recipeData.description,
            recipeData.instructions,
            recipeData.userId,
        ]);

        const recipeId = recipeResult.insertId;

        // tambah bahan
        if (ingredientsList && ingredientsList.length > 0) {
            for (const ingredient of ingredientsList) {
                await db(
                    "INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES (?, ?, ?, ?)",
                    [
                        recipeId,
                        ingredient.name,
                        ingredient.quantity || null,
                        ingredient.unit || null,
                    ],
                );
            }
        }

        return recipeId;
    }

    /*
     * Update resep
     */
    static async updateRecipe(recipeId, recipeData, ingredientsList, userId) {
        // update resep - reset status ke pending
        const recipeSql = `
			UPDATE recipes 
			SET name = ?, category = ?, description = ?, instructions = ?, 
			    status = 'pending', reviewed_by = NULL, reviewed_at = NULL, rejection_reason = NULL
			WHERE id = ? AND user_id = ?
		`;
        const result = await db(recipeSql, [
            recipeData.name,
            recipeData.category,
            recipeData.description,
            recipeData.instructions,
            recipeId,
            userId,
        ]);

        if (result.affectedRows === 0) {
            return false;
        }

        // update bahan jika diedit
        if (ingredientsList && ingredientsList.length > 0) {
            // hapus data bahan lama
            await db("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipeId]);

            // tambah data bahan baru
            for (const ingredient of ingredientsList) {
                await db(
                    "INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES (?, ?, ?, ?)",
                    [
                        recipeId,
                        ingredient.name,
                        ingredient.quantity || null,
                        ingredient.unit || null,
                    ],
                );
            }
        }

        return true;
    }

    /*
     * Hapus resep
     */
    static async deleteRecipe(recipeId, userId) {
        const sql = "DELETE FROM recipes WHERE id = ? AND user_id = ?";
        const result = await db(sql, [recipeId, userId]);
        return result.affectedRows > 0;
    }

    /*
     * Cek resep
     */
    static async recipeExists(recipeId) {
        const sql = "SELECT id FROM recipes WHERE id = ?";
        const rows = await db(sql, [recipeId]);
        return rows.length > 0;
    }

    /*
     * Cek owner resep
     */
    static async isRecipeOwner(recipeId, userId) {
        const sql = "SELECT id FROM recipes WHERE id = ? AND user_id = ?";
        const rows = await db(sql, [recipeId, userId]);
        return rows.length > 0;
    }

    /*
     * Get recipes by status (for moderation)
     */
    static async getRecipesByStatus(status) {
        const sql = `
            SELECT r.id, r.name, r.category,
                r.description, r.instructions,  /* ADD THIS LINE */
                r.status, r.reviewed_by, r.reviewed_at,
                r.rejection_reason, r.created_at, r.user_id,
                u.username as creator_username,
                reviewer.username as reviewer_username,
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        IFNULL(i.quantity, ''), 
                        ' ', 
                        IFNULL(i.unit, ''), 
                        ' ', 
                        i.ingredient
                    ) 
                    ORDER BY i.ingredient 
                    SEPARATOR ', '
                ) AS ingredients
            FROM recipes r 
            LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
            WHERE r.status = ?
            GROUP BY r.id, r.name, r.category, r.description, r.instructions, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.user_id, u.username, reviewer.username
            ORDER BY r.created_at ASC
        `;
        const rows = await db(sql, [status]);
        return rows;
    }

    /*
     * Approve a recipe
     */
    static async approveRecipe(recipeId, moderatorId) {
        const sql = `
			UPDATE recipes 
			SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = NULL
			WHERE id = ?
		`;
        const result = await db(sql, [moderatorId, recipeId]);
        return result.affectedRows > 0;
    }

    /*
     * Reject a recipe
     */
    static async rejectRecipe(recipeId, moderatorId, reason = null) {
        const sql = `
			UPDATE recipes 
			SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
			WHERE id = ?
		`;
        const result = await db(sql, [moderatorId, reason, recipeId]);
        return result.affectedRows > 0;
    }

    /*
     * Get moderation statistics
     */
    static async getModerationStats() {
        const sql = `
			SELECT 
				COUNT(*) as total,
				SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
				SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
				SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
			FROM recipes
		`;
        const rows = await db(sql, []);
        return rows[0];
    }
}

export default RecipeModel;
