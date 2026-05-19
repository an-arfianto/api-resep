import ErrorResponse from "../utils/errorResponse.js";

const role = { admin: 1, user: 2 };

function requireRole(roleId, roleName) {
    return (req, res, next) => {
        if (!req.user) return next(new ErrorResponse("Dibutuhkan autentikasi", 401));
        if (req.user.role_id !== roleId)
            return next(new ErrorResponse(`Dibutuhkan akses ${roleName}`, 403));
        next();
    };
}

export const adminMiddleware = requireRole(role.admin, "admin");
