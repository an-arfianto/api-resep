import db from "../config/database.js";
import RecipeModel from "./recipeModel.js";

class AdminModel {
    static async showAllUsers() {
        const sql = `
            SELECT u.id, u.username, u.role_id, r.name as role_name,
                   u.is_suspended, u.created_at,
                   COUNT(DISTINCT rec.id) as recipe_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN recipes rec ON u.id = rec.user_id
            GROUP BY u.id, u.username, u.role_id, r.name, u.is_suspended, u.created_at
            ORDER BY u.created_at DESC
        `;
        return await db(sql, []);
    }

    static async showAllRecipes() {
        const sql = `
            SELECT r.id, r.name, r.category, r.description, r.instructions,
                   r.status, r.user_id, r.created_at, r.rejection_reason,
                   r.reviewed_by, r.reviewed_at,
                   u.username as creator_username,
                   u.is_suspended as creator_is_suspended,
                   reviewer.username as reviewer_username,
                   GROUP_CONCAT(DISTINCT i.ingredient SEPARATOR ', ') as ingredients
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
            LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
            GROUP BY r.id, r.name, r.category, r.description, r.instructions,
                     r.status, r.user_id, r.created_at, r.rejection_reason,
                     r.reviewed_by, r.reviewed_at, u.username, u.is_suspended, reviewer.username
            ORDER BY r.created_at DESC
        `;
        return await db(sql, []);
    }

    static async showPendingRecipes() {
        const sql = `
            SELECT r.id, r.name, r.category, r.description, r.instructions,
                   r.status, r.user_id, r.created_at,
                   u.username as creator_username,
                   GROUP_CONCAT(DISTINCT i.ingredient SEPARATOR ', ') as ingredients
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN recipe_ingredients i ON r.id = i.recipe_id
            WHERE r.status = 'pending'
              AND u.is_suspended = 0
            GROUP BY r.id, r.name, r.category, r.description, r.instructions,
                     r.status, r.user_id, r.created_at, u.username
            ORDER BY r.created_at ASC
        `;
        return await db(sql, []);
    }

    static async approveRecipe(recipeId, adminId) {
        const [recipe] = await db(
            "SELECT r.id FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.id = ? AND u.is_suspended = 1",
            [recipeId],
        );
        if (recipe) throw new Error("Tidak dapat menyetujui resep dari user yang disuspend");

        const sql = `
            UPDATE recipes 
            SET status = 'approved', rejection_reason = NULL,
                reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'pending'
        `;
        const result = await db(sql, [adminId, recipeId]);
        return result.affectedRows > 0;
    }

    static async rejectRecipe(recipeId, adminId, reason) {
        const [recipe] = await db(
            "SELECT r.id FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.id = ? AND u.is_suspended = 1",
            [recipeId],
        );
        if (recipe) throw new Error("Tidak dapat mereview resep dari user yang disuspend");

        const sql = `
            UPDATE recipes 
            SET status = 'rejected', rejection_reason = ?,
                reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'pending'
        `;
        const result = await db(sql, [reason, adminId, recipeId]);
        return result.affectedRows > 0;
    }

    static async deleteRecipe(recipeId) {
        const sql = "DELETE FROM recipes WHERE id = ?";
        const result = await db(sql, [recipeId]);
        return result.affectedRows > 0;
    }

    static async showStats() {
        const [userCount] = await db("SELECT COUNT(*) as count FROM users", []);
        const [recipeCount] = await db("SELECT COUNT(*) as count FROM recipes", []);
        const [pendingCount] = await db(
            "SELECT COUNT(*) as count FROM recipes WHERE status = 'pending'",
            [],
        );
        const [suspendedCount] = await db(
            "SELECT COUNT(*) as count FROM users WHERE is_suspended = 1",
            [],
        );

        const categories = await db(
            `
            SELECT category, COUNT(*) as count 
            FROM recipes 
            GROUP BY category 
            ORDER BY count DESC
        `,
            [],
        );

        const [statusCount] = await db(
            `
            SELECT 
                SUM(status = 'pending') as pending,
                SUM(status = 'approved') as approved,
                SUM(status = 'rejected') as rejected
            FROM recipes
        `,
            [],
        );

        const roleDistribution = await db(
            `
            SELECT r.name as role_name, COUNT(u.id) as count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            GROUP BY r.name
            ORDER BY r.id ASC
        `,
            [],
        );

        return {
            totalUsers: userCount.count,
            totalRecipes: recipeCount.count,
            pendingRecipes: pendingCount.count,
            suspendedUsers: suspendedCount.count,
            recipesByCategory: categories,
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
            SELECT u.id, u.username, u.role_id, r.name as role_name,
                   u.is_suspended, u.created_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    static async suspendUser(userId) {
        const [user] = await db("SELECT role_id FROM users WHERE id = ?", [userId]);
        if (user?.role_id === 1) throw new Error("Tidak dapat suspend akun admin");

        const result = await db("UPDATE users SET is_suspended = 1 WHERE id = ? AND role_id != 1", [
            userId,
        ]);

        if (result.affectedRows > 0) {
            await db(
                "UPDATE recipes SET status = 'pending', reviewed_by = NULL, reviewed_at = NULL WHERE user_id = ? AND status = 'approved'",
                [userId],
            );
        }

        return result.affectedRows > 0;
    }

    static async unsuspendUser(userId) {
        const result = await db("UPDATE users SET is_suspended = 0 WHERE id = ?", [userId]);
        return result.affectedRows > 0;
    }

    static async deleteUser(userId) {
        const [user] = await db("SELECT role_id FROM users WHERE id = ?", [userId]);
        if (user?.role_id === 1) throw new Error("Tidak dapat menghapus akun admin");

        const result = await db("DELETE FROM users WHERE id = ? AND role_id != 1", [userId]);
        return result.affectedRows > 0;
    }
    static async showRecipe(recipeId) {
        return RecipeModel.showRecipe(recipeId, true);
    }
}

export default AdminModel;
