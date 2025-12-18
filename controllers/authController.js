import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

export const register = async (req, res, next) => {
	try {
		const { username, password, role_id } = req.body;

		if (!username || !password || !role_id) {
			return sendResponse(res, 400, {
				message: "username, password, and role_id required",
			});
		}

		// check if username exists
		const [existing] = await db("SELECT * FROM users WHERE username = ?", [
			username,
		]);
		if (existing) {
			return sendResponse(res, 400, {
				message: "Username telah digunakan",
			});
		}

		// check if role_id exists
		const [role] = await db("SELECT * FROM roles WHERE id = ?", [role_id]);
		if (!role) {
			return sendResponse(res, 400, { message: "Invalid role_id" });
		}

		// hash password
		const hashed = await bcrypt.hash(password, 10);

		// insert user
		await db(
			"INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)",
			[username, hashed, role_id],
		);

		return sendResponse(res, 201, {
			message: "Registrasi berhasil",
		});
	} catch (err) {
		next(new ErrorResponse(err.message, 500));
	}
};

export const login = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		if (!username || !password)
			return sendResponse(res, 400, {
				message: "Masukan username dan password",
			});

		const [user] = await db(
			`SELECT u.id, u.username, u.password, r.name AS role 
       FROM users u JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ?`,
			[username],
		);

		if (!user)
			return sendResponse(res, 401, { message: "Invalid credentials" });

		const match = await bcrypt.compare(password, user.password);
		if (!match)
			return sendResponse(res, 401, { message: "Invalid credentials" });

		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRE },
		);

		return sendResponse(res, 200, {
			message: "Login berhasil",
			token,
		});
	} catch (err) {
		next(new ErrorResponse(err.message, 500));
	}
};

export const getProfile = async (req, res, next) => {
	try {
		const [user] = await db(
			`SELECT u.id, u.username, r.name AS role 
       FROM users u JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
			[req.user.id],
		);
		if (!user)
			return sendResponse(res, 404, { message: "User tidak ditemukan" });
		return sendResponse(res, 200, { data: user });
	} catch (err) {
		next(new ErrorResponse(err.message, 500));
	}
};
