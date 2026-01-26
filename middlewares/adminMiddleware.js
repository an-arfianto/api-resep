import ErrorResponse from "../utils/errorResponse.js";

/**
 * Admin-only middleware
 * Checks if user is authenticated AND has admin role
 */
const adminMiddleware = (req, res, next) => {
    // Check if user is authenticated (authMiddleware should run first)
    if (!req.user) {
        return next(new ErrorResponse("Authentication required", 401));
    }

    // Check if user is admin (role_id = 1)
    if (req.user.role_id !== 1) {
        return next(new ErrorResponse("Admin access required", 403));
    }

    next();
};

export default adminMiddleware;
