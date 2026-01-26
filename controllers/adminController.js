import AdminModel from "../models/adminModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class AdminController {
    /**
     * Get all users with their recipe count
     */
    static async getAllUsers(req, res, next) {
        try {
            const users = await AdminModel.getAllUsersWithRecipeCount();

            res.status(200).json({
                success: true,
                message: "All users retrieved",
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all recipes (admin can see all)
     */
    static async getAllRecipes(req, res, next) {
        try {
            const recipes = await AdminModel.getAllRecipesWithDetails();

            res.status(200).json({
                success: true,
                message: "All recipes retrieved",
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete any recipe (admin power)
     */
    static async deleteRecipe(req, res, next) {
        try {
            const recipeId = parseInt(req.params.id);

            if (isNaN(recipeId)) {
                return next(new ErrorResponse("Invalid recipe ID", 400));
            }

            const success = await AdminModel.deleteRecipe(recipeId);

            if (!success) {
                return next(new ErrorResponse("Recipe not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "Recipe deleted by admin",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get system statistics
     */
    static async getStats(req, res, next) {
        try {
            const stats = await AdminModel.getSystemStats();

            res.status(200).json({
                success: true,
                message: "Statistics retrieved",
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Promote user to moderator
     */
    static async promoteToModerator(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("Invalid user ID", 400));
            }

            const success = await AdminModel.promoteToModerator(userId);

            if (!success) {
                return next(new ErrorResponse("User not found or already a moderator", 404));
            }

            res.status(200).json({
                success: true,
                message: "User promoted to moderator successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Demote moderator to user
     */
    static async demoteToUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("Invalid user ID", 400));
            }

            const success = await AdminModel.demoteToUser(userId);

            if (!success) {
                return next(new ErrorResponse("User not found or not a moderator", 404));
            }

            res.status(200).json({
                success: true,
                message: "Moderator demoted to user successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("Invalid user ID", 400));
            }

            // Prevent deleting yourself
            if (userId === req.user.id) {
                return next(new ErrorResponse("Cannot delete your own account", 400));
            }

            const success = await AdminModel.deleteUser(userId);

            if (!success) {
                return next(new ErrorResponse("User not found or cannot delete admin", 404));
            }

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    static async demoteToUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                return next(new ErrorResponse("Invalid user ID", 400));
            }
            const success = await AdminModel.demoteToUser(userId);
            if (!success) {
                return next(new ErrorResponse("User not found or not a moderator", 404));
            }
            res.status(200).json({
                success: true,
                message: "Moderator demoted to user successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController;
