import ErrorResponse from "../utils/errorResponse.js";

const suspendMiddleware = (req, res, next) => {
    if (!req.user) return next(new ErrorResponse("Dibutuhkan autentikasi", 401));
    if (req.user.is_suspended) return next(new ErrorResponse("Akun Anda telah disuspend", 403));
    next();
};

export default suspendMiddleware;
