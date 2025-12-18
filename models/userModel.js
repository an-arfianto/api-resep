import db from "../config/database.js";
import bcrypt from "bcryptjs";

// insert user
export async function insertUser(data) {
	const { username, password, role_id } = data;
	try {
		// Check if username already exists
		const existing = await db("SELECT * FROM users WHERE username = ?", [
			username,
		]);
		if (existing.length > 0) {
			throw new Error("Username telah digunakan!");
		}

		// Validate role
		const role = await db("SELECT * FROM roles WHERE id = ?", [role_id]);
		if (role.length === 0) {
			throw new Error("Role tidak valid!");
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert new user
		const result = await db(
			"INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)",
			[username, hashedPassword, role_id],
		);

		// Return new user info (no password)
		return {
			id: result.insertId,
			username,
			role_id,
		};
	} catch (err) {
		throw err;
	}
}

// get data user
export async function getUsers() {
	try {
		const statement = `
			SELECT u.id, u.username, r.name AS role 
            FROM users u INNER JOIN roles r
            ON u.role_id = r.id
        `;
		const results = await db(statement);

		return results; // controller handles response
	} catch (err) {
		throw err; // controller handles error
	}
}

// update data user
export async function updateUser(id, data) {
	try {
		const searchQuery = "SELECT * FROM users WHERE id = ?";
		const updateQuery = "UPDATE users SET ? WHERE id = ?";

		// Check if user exists
		const rows = await db(searchQuery, [id]);
		if (rows.length === 0) {
			throw new Error("Data tidak ditemukan!");
		}

		// Perform update
		await db(updateQuery, [data, id]);

		return { message: "Berhasil update data!" };
	} catch (err) {
		throw err;
	}
}

// delete user
export async function deleteUser(id) {
	try {
		const searchQuery = "SELECT * FROM users WHERE id = ?";
		const deleteQuery = "DELETE FROM users WHERE id = ?";

		// Check if data exists
		const rows = await db(searchQuery, [id]);
		if (rows.length === 0) {
			throw new Error("Data tidak ditemukan!");
		}

		// Delete if exists
		await db(deleteQuery, [id]);

		return { message: "Berhasil hapus data!" };
	} catch (err) {
		throw err;
	}
}
