import AdminModel from "../models/adminModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class AdminController {
    // semua user
    static async getAllUsers(req, res, next) {
        try {
            const users = await AdminModel.getAllUsersWithRecipeCount();

            res.status(200).json({
                success: true,
                message: "Menampilkan semua data",
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    // semua resep
    static async getAllRecipes(req, res, next) {
        try {
            const recipes = await AdminModel.getAllRecipesWithDetails();

            res.status(200).json({
                success: true,
                message: "Menampilkan semua resep",
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    // hapus resep
    static async deleteRecipe(req, res, next) {
        try {
            const recipeId = parseInt(req.params.id);

            if (isNaN(recipeId)) {
                return next(new ErrorResponse("id resep invalid", 400));
            }

            const success = await AdminModel.deleteRecipe(recipeId);

            if (!success) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            res.status(200).json({
                success: true,
                message: "Resep berhasil dihapus",
            });
        } catch (error) {
            next(error);
        }
    }

    // sistem stats
    static async getStats(req, res, next) {
        try {
            const stats = await AdminModel.getSystemStats();

            res.status(200).json({
                success: true,
                message: "Menampilkan statistik",
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    // naik jabatan
    static async promoteToModerator(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            const success = await AdminModel.promoteToModerator(userId);

            if (!success) {
                return next(new ErrorResponse("User tidak ada/telah menjadi moderator", 404));
            }

            res.status(200).json({
                success: true,
                message: "User berhasil naik ke moderator",
            });
        } catch (error) {
            next(error);
        }
    }

    // turun jabatan
    static async demoteToUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            const success = await AdminModel.demoteToUser(userId);

            if (!success) {
                return next(new ErrorResponse("User tidak ada/bukan moderator", 404));
            }

            res.status(200).json({
                success: true,
                message: "Moderator berhasil turun ke user biasa",
            });
        } catch (error) {
            next(error);
        }
    }

    // hapus user
    static async deleteUser(req, res, next) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            if (userId === req.user.id) {
                return next(new ErrorResponse("Tidak bisa menghapus akun anda sendiri", 400));
            }

            const success = await AdminModel.deleteUser(userId);

            if (!success) {
                return next(new ErrorResponse("User tidak ada/tidak bisa dihapus oleh admin", 404));
            }

            res.status(200).json({
                success: true,
                message: "User berhasil dihapus",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController;
