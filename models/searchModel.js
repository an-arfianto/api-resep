import db from "../config/database.js";

class SearchModel {
    static async searchOR(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return [];
        }

        const placeholders = ingredients.map(() => "?").join(",");

        const sql = `
            SELECT r.id, r.name, r.category,
                u.username as creator_username,
                GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients,
                COUNT(DISTINCT CASE WHEN i.ingredient IN (${placeholders}) THEN i.ingredient END) AS matched_count
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN recipe_ingredients i ON r.id = i.recipe_id
            WHERE i.ingredient IN (${placeholders})
                AND r.status = 'approved'
            GROUP BY r.id, r.name, r.category, u.username
            ORDER BY matched_count DESC, r.name ASC
        `;

        const rows = await db(sql, [...ingredients, ...ingredients]);
        return rows;
    }

    static async searchAND(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return [];
        }

        const placeholders = ingredients.map(() => "?").join(",");

        const sql = `
            SELECT r.id, r.name, r.category,
                u.username as creator_username,
                GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN recipe_ingredients i ON r.id = i.recipe_id
            WHERE i.ingredient IN (${placeholders})
                AND r.status = 'approved'
            GROUP BY r.id, r.name, r.category, u.username
            HAVING COUNT(DISTINCT i.ingredient) = ?
            ORDER BY r.name ASC
        `;

        const rows = await db(sql, [...ingredients, ingredients.length]);
        return rows;
    }

    static async searchNOT(includedIngredients, excludedIngredients) {
        if (!includedIngredients || includedIngredients.length === 0) return [];

        const includedPlaceholders = includedIngredients.map(() => "?").join(",");

        let sql = `
            SELECT r.id, r.name, r.category,
                u.username as creator_username,
                GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients,
                COUNT(DISTINCT CASE WHEN i.ingredient IN (${includedPlaceholders}) THEN i.ingredient END) AS matched_count
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN recipe_ingredients i ON r.id = i.recipe_id
            WHERE r.id IN (
                SELECT recipe_id FROM recipe_ingredients
                WHERE ingredient IN (${includedPlaceholders})
            )
        `;

        const params = [...includedIngredients, ...includedIngredients];

        if (excludedIngredients && excludedIngredients.length > 0) {
            const excludedPlaceholders = excludedIngredients.map(() => "?").join(",");
            sql += `
                AND r.id NOT IN (
                    SELECT recipe_id FROM recipe_ingredients
                    WHERE ingredient IN (${excludedPlaceholders})
                )
            `;
            params.push(...excludedIngredients);
        }

        sql += `
            AND r.status = 'approved'
            GROUP BY r.id, r.name, r.category, u.username
            ORDER BY matched_count DESC, r.name ASC
        `;

        const rows = await db(sql, params);
        return rows;
    }

    static async booleanSearch(search) {
        const { operator = "OR", ingredients, excludedIngredients = [] } = search;

        switch (operator.toUpperCase()) {
            case "AND":
                return await this.searchAND(ingredients);
            case "OR":
                return await this.searchOR(ingredients);
            case "NOT":
                return await this.searchNOT(ingredients, excludedIngredients);
            default:
                throw new Error(`Invalid operator: ${operator}`);
        }
    }
}

export default SearchModel;
