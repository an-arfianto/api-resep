import AdminModel from "../models/adminModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class AdminController {
    static async showAllUsers(req, res, next) {
        try {
            const users = await AdminModel.showAllUsers();

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

    static async showAllRecipes(req, res, next) {
        try {
            const recipes = await AdminModel.showAllRecipes();

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

    static async deleteRecipe(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("id resep invalid", 400));
            }

            const success = await AdminModel.deleteRecipe(req.params.id);

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

    static async showStats(req, res, next) {
        try {
            const stats = await AdminModel.showStats();

            res.status(200).json({
                success: true,
                message: "Menampilkan statistik",
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    static async promote(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            const success = await AdminModel.promote(req.params.id);

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

    static async demote(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            const success = await AdminModel.demote(req.params.id);

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

    static async deleteUser(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("id user invalid", 400));
            }

            if (req.params.id === req.user.id) {
                return next(new ErrorResponse("Tidak bisa menghapus akun anda sendiri", 400));
            }

            const success = await AdminModel.deleteUser(req.params.id);

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
