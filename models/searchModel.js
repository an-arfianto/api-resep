import db from "../config/database.js";

class SearchModel {
    /**
     * Search recipes using OR logic
     */
    static async searchWithOR(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return [];
        }

        const placeholders = ingredients.map(() => "?").join(",");

        const sql = `
			SELECT r.id, r.name, r.category,
				GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients,
				COUNT(DISTINCT CASE WHEN i.ingredient IN (${placeholders}) THEN i.ingredient END) AS matched_count
			FROM recipes r 
			JOIN recipe_ingredients i ON r.id = i.recipe_id
			WHERE i.ingredient IN (${placeholders})
			GROUP BY r.id, r.name, r.category
			ORDER BY matched_count DESC, r.name ASC
		`;

        const params = [...ingredients, ...ingredients];
        const rows = await db(sql, params);
        return rows;
    }

    /**
     * Search recipes using AND logic
     */
    static async searchWithAND(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return [];
        }

        const placeholders = ingredients.map(() => "?").join(",");
        const ingredientCount = ingredients.length;

        const sql = `
			SELECT r.id, r.name, r.category,
			GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients
			FROM recipes r 
			JOIN recipe_ingredients i ON r.id = i.recipe_id
			WHERE r.id IN (
				SELECT recipe_id
				FROM recipe_ingredients
				WHERE ingredient IN (${placeholders})
				GROUP BY recipe_id
				HAVING COUNT(DISTINCT ingredient) = ?
			)
			GROUP BY r.id, r.name, r.category
			ORDER BY r.name ASC
		`;

        const params = [...ingredients, ingredientCount];
        const rows = await db(sql, params);
        return rows;
    }

    /**
     * Search recipes using NOT logic
     */
    static async searchWithNOT(includedIngredients, excludedIngredients) {
        if (!includedIngredients || includedIngredients.length === 0) {
            return [];
        }

        const includedPlaceholders = includedIngredients.map(() => "?").join(",");
        const excludedPlaceholders = excludedIngredients.map(() => "?").join(",");

        let sql = `
			SELECT r.id, r.name, r.category,
			GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient SEPARATOR ', ') AS ingredients
			FROM recipes r 
			JOIN recipe_ingredients i ON r.id = i.recipe_id
			WHERE r.id IN (
				SELECT recipe_id
				FROM recipe_ingredients
				WHERE ingredient IN (${includedPlaceholders})
			)
		`;

        const params = [...includedIngredients];

        if (excludedIngredients && excludedIngredients.length > 0) {
            sql += `
				AND r.id NOT IN (
					SELECT recipe_id
					FROM recipe_ingredients
					WHERE ingredient IN (${excludedPlaceholders})
				)
			`;
            params.push(...excludedIngredients);
        }

        sql += `
			GROUP BY r.id, r.name, r.category
			ORDER BY r.name ASC
		`;

        const rows = await db(sql, params);
        return rows;
    }

    /**
     * Boolean search dispatcher
     */
    static async booleanSearch(searchCriteria) {
        const { operator = "OR", ingredients, excludedIngredients = [] } = searchCriteria;

        switch (operator.toUpperCase()) {
            case "AND":
                return await this.searchWithAND(ingredients);
            case "OR":
                return await this.searchWithOR(ingredients);
            case "NOT":
                return await this.searchWithNOT(ingredients, excludedIngredients);
            default:
                throw new Error(`Invalid operator: ${operator}`);
        }
    }
}

export default SearchModel;
