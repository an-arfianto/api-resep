import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse.js";

export const protect = (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return sendResponse(res, 401, { message: "Not authorized, no token" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return sendResponse(res, 401, { message: "Invalid or expired token" });
	}
};

// Role-based access
export const authorize = (...allowedRoles) => {
	return (req, res, next) => {
		if (!allowedRoles.includes(req.user.role)) {
			return sendResponse(res, 403, {
				message: "Forbidden: insufficient permissions",
			});
		}
		next();
	};
};
