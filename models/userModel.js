import bcrypt from "bcrypt";
import db from "../config/database.js";

class UserModel {
    static async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const result = await db("INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)", [
            userData.username,
            hashedPassword,
            userData.role_id,
        ]);

        return result.insertId;
    }

    static async findUsername(username) {
        const sql = `
			SELECT u.id, u.username, u.password, u.role_id, r.name as role_name
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			WHERE u.username = ?
		`;
        const rows = await db(sql, [username]);
        return rows[0];
    }

    static async findId(userId) {
        const sql = `
			SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			WHERE u.id = ?
		`;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findUserWithPassword(userId) {
        const sql = `
        SELECT u.id, u.username, u.password, u.role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
    `;
        const rows = await db(sql, [userId]);
        return rows[0];
    }

    static async usernameExists(username) {
        const rows = await db("SELECT id FROM users WHERE username = ?", [username]);
        return rows.length > 0;
    }

    static async showAllUsers() {
        const sql = `
			SELECT u.id, u.username, u.role_id, r.name as role_name, u.created_at
			FROM users u
			LEFT JOIN roles r ON u.role_id = r.id
			ORDER BY u.created_at DESC
		`;
        const rows = await db(sql, []);
        return rows;
    }

    static async updateProfile(userId, username) {
        const exist = await db("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);

        if (exist.length > 0) {
            throw new Error("Username telah dipakai");
        }

        const result = await db("UPDATE users SET username = ? WHERE id = ?", [username, userId]);
        return result.affectedRows > 0;
    }

    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await db("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);
        return result.affectedRows > 0;
    }

    static async showUserStats(userId) {
        const sql = `
            SELECT
                u.id, u.username, u.role_id, r.name as role_name, u.created_at,
                COUNT(rec.id) as recipe_count,
                SUM(rec.status = 'approved') as approved_count,
                SUM(rec.status = 'pending') as pending_count,
                SUM(rec.status = 'rejected') as rejected_count
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
