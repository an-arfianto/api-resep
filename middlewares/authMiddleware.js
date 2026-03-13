import jwt from "jsonwebtoken";
import ErrorResponse from "../utils/errorResponse.js";

// autentikasi
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new ErrorResponse("Token tidak ditemukan", 401));
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
