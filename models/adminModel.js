import db from "../config/database.js";

class AdminModel {
    /*
     * Get all users with their recipe count
     */
    static async getAllUsersWithRecipeCount() {
        const sql = `
            SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at,
                   COUNT(DISTINCT rec.id) as recipe_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN recipes rec ON u.id = rec.user_id
            GROUP BY u.id, u.username, u.role_id, r.name, u.created_at
            ORDER BY u.created_at DESC
        `;
        const rows = await db(sql, []);
        return rows;
    }

    /*
     * Get all recipes with author details and ingredients
     */
    static async getAllRecipesWithDetails() {
        const sql = `
            SELECT r.id, r.name, r.category, r.status, r.user_id, u.username as author,
                   r.created_at,
                   GROUP_CONCAT(DISTINCT i.ingredient SEPARATOR ', ') as ingredients
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
            GROUP BY r.id, r.name, r.category, r.status, r.user_id, u.username, r.created_at
            ORDER BY r.created_at DESC
        `;
        const rows = await db(sql, []);
        return rows;
    }

    /*
     * Delete any recipe (admin power - bypasses ownership check)
     */
    static async deleteRecipe(recipeId) {
        const sql = "DELETE FROM recipes WHERE id = ?";
        const result = await db(sql, [recipeId]);
        return result.affectedRows > 0;
    }

    /*
     * Get system statistics
     */
    static async getSystemStats() {
        // Get total users count
        const userCountSql = "SELECT COUNT(*) as count FROM users";
        const [userCount] = await db(userCountSql, []);

        // Get total recipes count
        const recipeCountSql = "SELECT COUNT(*) as count FROM recipes";
        const [recipeCount] = await db(recipeCountSql, []);

        // Get recipes grouped by category
        const categoryCountSql = `
            SELECT category, COUNT(*) as count 
            FROM recipes 
            GROUP BY category 
            ORDER BY count DESC
        `;
        const categories = await db(categoryCountSql, []);

        return {
            totalUsers: userCount.count,
            totalRecipes: recipeCount.count,
            recipesByCategory: categories,
        };
    }

    /*
     * Get user by ID (admin view - includes sensitive info if needed)
     */
    static async getUserById(userId) {
        const sql = `
            SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    /*
     * Update user role (admin power)
     */
    static async updateUserRole(userId, roleId) {
        const sql = "UPDATE users SET role_id = ? WHERE id = ?";
        const result = await db(sql, [roleId, userId]);
        return result.affectedRows > 0;
    }

    /*
     * Delete user (admin power - cannot delete admin)
     */
    static async deleteUser(userId) {
        // Check if user is admin
        const checkSql = "SELECT role_id FROM users WHERE id = ?";
        const [user] = await db(checkSql, [userId]);

        if (user && user.role_id === 1) {
            throw new Error("Cannot delete admin user");
        }

        const sql = "DELETE FROM users WHERE id = ? AND role_id != 1";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }

    /*
     * Promote user to moderator
     */
    static async promoteToModerator(userId) {
        const sql = "UPDATE users SET role_id = 3 WHERE id = ? AND role_id = 2";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }

    /*
     * Demote moderator to user
     */
    static async demoteToUser(userId) {
        const sql = "UPDATE users SET role_id = 2 WHERE id = ? AND role_id = 3";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }
}

export default AdminModel;
