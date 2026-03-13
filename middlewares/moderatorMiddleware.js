import ErrorResponse from "../utils/errorResponse.js";

// untuk cek apakah sudah login dan user = moderator
const moderatorMiddleware = (req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse("Dibutuhkan autentikasi", 401));
    }

    if (req.user.role_id !== 2) {
        return next(new ErrorResponse("Dibutuhkan akses moderator", 403));
    }

    next();
};

export default moderatorMiddleware;
