import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authMiddleware = (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return next(new ErrorResponse("Token tidak ditemukan", 401));
		}

		const token = authHeader.split(" ")[1];

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Add user info to request
		req.user = {
			id: decoded.id,
			username: decoded.username,
			role_id: decoded.role_id,
		};

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return next(new ErrorResponse("Token tidak valid", 401));
		}
		if (error.name === "TokenExpiredError") {
			return next(new ErrorResponse("Token sudah kadaluarsa", 401));
		}
		return next(new ErrorResponse("Autentikasi gagal", 401));
	}
};

export default authMiddleware;
