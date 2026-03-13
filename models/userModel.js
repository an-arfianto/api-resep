import db from "../config/database.js";
import bcrypt from "bcrypt";

class UserModel {
    // tambah user
    static async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const sql = "INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)";
        const result = await db(sql, [userData.username, hashedPassword, userData.role_id]);

        return result.insertId;
    }

    // cari username
    static async findByUsername(username) {
        const sql = `
			SELECT u.id, u.username, u.password, u.role_id, r.name as role_name
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			WHERE u.username = ?
		`;
        const rows = await db(sql, [username]);
        return rows[0];
    }

    // cari detail user id
    static async findById(userId) {
        const sql = `
			SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			WHERE u.id = ?
		`;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    // verifikasi password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // detail user dg password
    static async findByIdWithPassword(userId) {
        const sql = `
        SELECT u.id, u.username, u.password, u.role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
    `;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    // username terpakai/tidak
    static async usernameExists(username) {
        const sql = "SELECT id FROM users WHERE username = ?";
        const rows = await db(sql, [username]);
        return rows.length > 0;
    }

    // data semua users (keperluan admin)
    static async getAllUsers() {
        const sql = `
			SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			ORDER BY u.created_at DESC
		`;
        const rows = await db(sql, []);
        return rows;
    }

    // update username
    static async updateProfile(userId, username) {
        const checkSql = "SELECT id FROM users WHERE username = ? AND id != ?";
        const existing = await db(checkSql, [username, userId]);

        if (existing.length > 0) {
            throw new Error("Username telah dipakai");
        }

        const sql = "UPDATE users SET username = ? WHERE id = ?";
        const result = await db(sql, [username, userId]);
        return result.affectedRows > 0;
    }

    // update password
    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE users SET password = ? WHERE id = ?";
        const result = await db(sql, [hashedPassword, userId]);
        return result.affectedRows > 0;
    }

    // user stats
    static async getUserStats(userId) {
        const sql = `
            SELECT 
                u.id, u.username, u.role_id, r.name as role_name, u.created_at,
                COUNT(rec.id) as recipe_count,
                SUM(CASE WHEN rec.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN rec.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN rec.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN recipes rec ON u.id = rec.user_id
            WHERE u.id = ?
            GROUP BY u.id, u.username, u.role_id, r.name, u.created_at
        `;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    // admin stats
    static async getAdminStats() {
        const userCountSql = "SELECT COUNT(*) as total_users FROM users";
        const [userCount] = await db(userCountSql, []);

        const recipeCountSql = "SELECT COUNT(*) as total_recipes FROM recipes";
        const [recipeCount] = await db(recipeCountSql, []);

        const pendingSql = "SELECT COUNT(*) as pending_count FROM recipes WHERE status = 'pending'";
        const [pendingCount] = await db(pendingSql, []);

        const categoriesSql = "SELECT COUNT(DISTINCT category) as total_categories FROM recipes";
        const [categoriesCount] = await db(categoriesSql, []);

        return {
            total_users: userCount.total_users,
            total_recipes: recipeCount.total_recipes,
            pending_count: pendingCount.pending_count,
            total_categories: categoriesCount.total_categories,
        };
    }
}

export default UserModel;
