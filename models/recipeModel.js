import db from "../config/database.js";

class RecipeModel {
    // semua resep
    static async getAllRecipes(filters = {}) {
        let sql = `
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
            WHERE 1=1
        `;
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

        sql += `
			GROUP BY r.id, r.name, r.category, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.user_id, u.username, reviewer.username
			ORDER BY r.created_at DESC
		`;

        const rows = await db(sql, params);
        return rows;
    }

    // detail resep id
    static async getRecipeById(recipeId, includeStatus = false) {
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

        // bahan dengan takaran
        const ingredientsSql = `
			SELECT ingredient, quantity, unit
			FROM recipe_ingredients
			WHERE recipe_id = ?
			ORDER BY ingredient
		`;

        const ingredients = await db(ingredientsSql, [recipeId]);

        // format bahan (array obj)
        recipe.ingredients = ingredients.map((i) => ({
            name: i.ingredient,
            quantity: i.quantity,
            unit: i.unit,
            display: `${i.quantity ? i.quantity : ""} ${i.unit ? i.unit : ""} ${i.ingredient}`.trim(),
        }));

        // string format
        recipe.ingredientsText = ingredients
            .map((i) => `${i.quantity ? i.quantity : ""} ${i.unit ? i.unit : ""} ${i.ingredient}`.trim())
            .join(", ");

        return recipe;
    }

    // tambah resep
    static async createRecipe(recipeData, ingredientsList) {
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

        if (ingredientsList && ingredientsList.length > 0) {
            for (const ingredient of ingredientsList) {
                await db("INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES (?, ?, ?, ?)", [
                    recipeId,
                    ingredient.name,
                    ingredient.quantity || null,
                    ingredient.unit || null,
                ]);
            }
        }

        return recipeId;
    }

    // update resep
    static async updateRecipe(recipeId, recipeData, ingredientsList, userId) {
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
            await db("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipeId]);

            for (const ingredient of ingredientsList) {
                await db("INSERT INTO recipe_ingredients (recipe_id, ingredient, quantity, unit) VALUES (?, ?, ?, ?)", [
                    recipeId,
                    ingredient.name,
                    ingredient.quantity || null,
                    ingredient.unit || null,
                ]);
            }
        }

        return true;
    }

    // hapus resep
    static async deleteRecipe(recipeId, userId) {
        const sql = "DELETE FROM recipes WHERE id = ? AND user_id = ?";
        const result = await db(sql, [recipeId, userId]);
        return result.affectedRows > 0;
    }

    // cek resep
    static async recipeExists(recipeId) {
        const sql = "SELECT id FROM recipes WHERE id = ?";
        const rows = await db(sql, [recipeId]);
        return rows.length > 0;
    }

    // cek owner resep
    static async isRecipeOwner(recipeId, userId) {
        const sql = "SELECT id FROM recipes WHERE id = ? AND user_id = ?";
        const rows = await db(sql, [recipeId, userId]);
        return rows.length > 0;
    }

    // data resep dg status
    static async getRecipesByStatus(status) {
        const sql = `
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
            WHERE r.status = ?
            GROUP BY r.id, r.name, r.category, r.description, r.instructions, r.status, r.reviewed_by, r.reviewed_at, r.rejection_reason, r.created_at, r.user_id, u.username, reviewer.username
            ORDER BY r.created_at ASC
        `;
        const rows = await db(sql, [status]);
        return rows;
    }

    // setujui resep
    static async approveRecipe(recipeId, moderatorId) {
        const sql = `
			UPDATE recipes 
			SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = NULL
			WHERE id = ?
		`;
        const result = await db(sql, [moderatorId, recipeId]);
        return result.affectedRows > 0;
    }

    // tolak resep
    static async rejectRecipe(recipeId, moderatorId, reason = null) {
        const sql = `
			UPDATE recipes 
			SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
			WHERE id = ?
		`;
        const result = await db(sql, [moderatorId, reason, recipeId]);
        return result.affectedRows > 0;
    }

    // moderator statistik
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

    // moderator statistik (personal)
    static async getModeratorPersonalStats(moderatorId) {
        const sql = `
            SELECT 
                COUNT(*) as reviewed_count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
            FROM recipes
            WHERE reviewed_by = ?
        `;
        const [stats] = await db(sql, [moderatorId]);

        // Get system-wide pending count
        const pendingSql = "SELECT COUNT(*) as pending_count FROM recipes WHERE status = 'pending'";
        const [pendingResult] = await db(pendingSql, []);

        return {
            reviewed_count: stats.reviewed_count || 0,
            approved_count: stats.approved_count || 0,
            rejected_count: stats.rejected_count || 0,
            pending_count: pendingResult.pending_count || 0,
        };
    }

    // moderator profile stats (full stats untuk moderator)
    static async getModeratorProfileStats(moderatorId) {
        const moderationSql = `
            SELECT 
                COUNT(*) as reviewed_count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
            FROM recipes
            WHERE reviewed_by = ?
        `;
        const [moderationStats] = await db(moderationSql, [moderatorId]);

        const pendingSql = "SELECT COUNT(*) as pending_count FROM recipes WHERE status = 'pending'";
        const [pendingResult] = await db(pendingSql, []);

        const personalRecipesSql = `
            SELECT 
                COUNT(*) as my_recipe_count,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as my_approved_count,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as my_pending_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as my_rejected_count
            FROM recipes
            WHERE user_id = ?
        `;
        const [personalStats] = await db(personalRecipesSql, [moderatorId]);

        return {
            reviewed_count: moderationStats.reviewed_count || 0,
            approved_count: moderationStats.approved_count || 0,
            rejected_count: moderationStats.rejected_count || 0,
            pending_count: pendingResult.pending_count || 0,
            my_recipe_count: personalStats.my_recipe_count || 0,
            my_approved_count: personalStats.my_approved_count || 0,
            my_pending_count: personalStats.my_pending_count || 0,
            my_rejected_count: personalStats.my_rejected_count || 0,
        };
    }
}

export default RecipeModel;
