import ErrorResponse from "../utils/errorResponse.js";

const role = { admin: 1, moderator: 2 };

function requireRole(roleId, roleName) {
    return (req, res, next) => {
        if (!req.user) return next(new ErrorResponse("Dibutuhkan autentikasi", 401));
        if (req.user.role_id !== roleId)
            return next(new ErrorResponse(`Dibutuhkan akses ${roleName}`, 403));

        next();
    };
}

export const adminMiddleware = requireRole(role.admin, "admin");
export const moderatorMiddleware = requireRole(role.moderator, "moderator");
