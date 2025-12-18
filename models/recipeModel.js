import db from "../config/database.js";

export async function searchRecipesOR(ingredients) {
	try {
		// Build dynamic placeholders (?,?,?,...)
		const placeholders = ingredients.map(() => "?").join(",");

		const sql = `
            SELECT r.id, r.name,
            GROUP_CONCAT(DISTINCT i2.ingredient SEPARATOR ', ') AS ingredient
            FROM recipes r 
            JOIN recipe_ingredients i ON r.id = i.recipe_id
            JOIN recipe_ingredients i2 ON r.id = i2.recipe_id
            WHERE i.ingredient IN (${placeholders})
            GROUP BY r.id, r.name
        `;

		const rows = await db(sql, ingredients);
		return rows;
	} catch (err) {
		throw err;
	}
}
