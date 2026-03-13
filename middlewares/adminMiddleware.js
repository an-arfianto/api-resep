import ErrorResponse from "../utils/errorResponse.js";

// untuk cek apakah sudah login dan user = admin
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse("Dibutuhkan autentikasi", 401));
    }

    if (req.user.role_id !== 1) {
        return next(new ErrorResponse("Dibutuhkan akses admin", 403));
    }

    next();
};

export default adminMiddleware;
