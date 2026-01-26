import db from "../config/database.js";
import bcrypt from "bcrypt";

class UserModel {
    /*
     * Create new user
     */
    static async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const sql = "INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)";
        const result = await db(sql, [userData.username, hashedPassword, userData.role_id]);

        return result.insertId;
    }

    /*
     * Find user by username
     */
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

    /*
     * Find user by ID
     */
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

    /*
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /*
     * get user with password
     */
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

    /*
     * Check if username exists
     */
    static async usernameExists(username) {
        const sql = "SELECT id FROM users WHERE username = ?";
        const rows = await db(sql, [username]);
        return rows.length > 0;
    }

    /*
     * Get all users (admin only)
     */
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

    /*
     * Update user profile (username)
     */
    static async updateProfile(userId, username) {
        // Check if username already taken by another user
        const checkSql = "SELECT id FROM users WHERE username = ? AND id != ?";
        const existing = await db(checkSql, [username, userId]);

        if (existing.length > 0) {
            throw new Error("Username already taken");
        }

        const sql = "UPDATE users SET username = ? WHERE id = ?";
        const result = await db(sql, [username, userId]);
        return result.affectedRows > 0;
    }

    /*
     * Update user password
     */
    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE users SET password = ? WHERE id = ?";
        const result = await db(sql, [hashedPassword, userId]);
        return result.affectedRows > 0;
    }

    /*
     * Get user stats (recipe count, etc)
     */
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
}

export default UserModel;
