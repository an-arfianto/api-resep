import ErrorResponse from "../utils/errorResponse.js";

/**
 * Moderator middleware
 * Checks if user is authenticated AND has moderator or admin role
 */
const moderatorMiddleware = (req, res, next) => {
    // Check if user is authenticated (authMiddleware should run first)
    if (!req.user) {
        return next(new ErrorResponse("Authentication required", 401));
    }

    // Check if user is moderator (role_id = 3) or admin (role_id = 1)
    if (req.user.role_id !== 3 && req.user.role_id !== 1) {
        return next(new ErrorResponse("Moderator access required", 403));
    }

    next();
};

export default moderatorMiddleware;
