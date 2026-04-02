import db from "../config/database.js";

class AdminModel {
    static async showAllUsers() {
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

    static async showAllRecipes() {
        const sql = `
            SELECT r.id, r.name, r.category, r.status, r.user_id, u.username as author,
                   r.created_at, r.rejection_reason,
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

    static async deleteRecipe(recipeId) {
        const sql = "DELETE FROM recipes WHERE id = ?";
        const result = await db(sql, [recipeId]);
        return result.affectedRows > 0;
    }

    static async showStats() {
        const userCountSql = "SELECT COUNT(*) as count FROM users";
        const [userCount] = await db(userCountSql, []);

        const recipeCountSql = "SELECT COUNT(*) as count FROM recipes";
        const [recipeCount] = await db(recipeCountSql, []);

        const categoryCountSql = `
            SELECT category, COUNT(*) as count 
            FROM recipes 
            GROUP BY category 
            ORDER BY count DESC
        `;
        const categories = await db(categoryCountSql, []);

        const statusCountSql = `
            SELECT 
                SUM(status = 'pending') as pending,
                SUM(status = 'approved') as approved,
                SUM(status = 'rejected') as rejected
            FROM recipes
        `;
        const [statusCount] = await db(statusCountSql, []);

        const roleCountSql = `
            SELECT r.name as role_name, COUNT(u.id) as count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            GROUP BY r.name
            ORDER BY r.id ASC
        `;
        const roleDistribution = await db(roleCountSql, []);

        const pendingCountSql = "SELECT COUNT(*) as count FROM recipes WHERE status = 'pending'";
        const [pendingCount] = await db(pendingCountSql, []);

        return {
            totalUsers: userCount.count,
            totalRecipes: recipeCount.count,
            recipesByCategory: categories,
            pendingRecipes: pendingCount.count,
            recipesByStatus: {
                pending: statusCount.pending || 0,
                approved: statusCount.approved || 0,
                rejected: statusCount.rejected || 0,
            },
            usersByRole: roleDistribution,
        };
    }

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

    static async updateUserRole(userId, roleId) {
        const sql = "UPDATE users SET role_id = ? WHERE id = ?";
        const result = await db(sql, [roleId, userId]);
        return result.affectedRows > 0;
    }

    static async deleteUser(userId) {
        const checkSql = "SELECT role_id FROM users WHERE id = ?";
        const [user] = await db(checkSql, [userId]);

        if (user && user.role_id === 1) {
            throw new Error("Cannot delete admin user");
        }

        const sql = "DELETE FROM users WHERE id = ? AND role_id != 1";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }

    static async promote(userId) {
        const sql = "UPDATE users SET role_id = 2 WHERE id = ? AND role_id = 3";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }

    static async demote(userId) {
        const sql = "UPDATE users SET role_id = 3 WHERE id = ? AND role_id = 2";
        const result = await db(sql, [userId]);
        return result.affectedRows > 0;
    }
}

export default AdminModel;
