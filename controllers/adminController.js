import AdminModel from "../models/adminModel.js";
import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class AdminController {
    static async showAllUsers(req, res, next) {
        try {
            const users = await AdminModel.showAllUsers();

            res.status(200).json({
                success: true,
                message: "Menampilkan semua data user",
                count: users.length,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    static async suspendUser(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id user invalid", 400));
            }

            if (Number(req.params.id) === req.user.id) {
                return next(new ErrorResponse("Tidak bisa suspend akun anda sendiri", 400));
            }

            const success = await AdminModel.suspendUser(req.params.id);

            if (!success) {
                return next(new ErrorResponse("User tidak ada atau sudah disuspend", 404));
            }

            res.status(200).json({
                success: true,
                message: "User berhasil disuspend",
            });
        } catch (error) {
            if (error.message === "Tidak dapat suspend akun admin") {
                return next(new ErrorResponse(error.message, 403));
            }
            next(error);
        }
    }

    static async unsuspendUser(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id user invalid", 400));
            }

            const success = await AdminModel.unsuspendUser(req.params.id);

            if (!success) {
                return next(new ErrorResponse("User tidak ada", 404));
            }

            res.status(200).json({
                success: true,
                message: "User berhasil di-unsuspend",
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id user invalid", 400));
            }

            if (Number(req.params.id) === req.user.id) {
                return next(new ErrorResponse("Tidak bisa menghapus akun anda sendiri", 400));
            }

            const success = await AdminModel.deleteUser(req.params.id);

            if (!success) {
                return next(new ErrorResponse("User tidak ada", 404));
            }

            res.status(200).json({
                success: true,
                message: "User berhasil dihapus",
            });
        } catch (error) {
            if (error.message === "Tidak dapat menghapus akun admin") {
                return next(new ErrorResponse(error.message, 403));
            }
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

    static async showPendingRecipes(req, res, next) {
        try {
            const recipes = await AdminModel.showPendingRecipes();

            res.status(200).json({
                success: true,
                message: "Menampilkan resep pending",
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    static async showRecipe(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id resep invalid", 400));
            }

            const recipe = await AdminModel.showRecipe(req.params.id);
            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            res.status(200).json({
                success: true,
                message: "Menampilkan resep",
                data: recipe,
            });
        } catch (error) {
            next(error);
        }
    }

    static async showRecipesByStatus(req, res, next) {
        try {
            const { status } = req.query;
            if (!status || !["pending", "approved", "rejected"].includes(status)) {
                return next(new ErrorResponse("Status invalid", 400));
            }

            const recipes = await RecipeModel.showRecipeStatus(status);

            res.status(200).json({
                success: true,
                count: recipes.length,
                data: recipes,
            });
        } catch (error) {
            next(error);
        }
    }

    static async approveRecipe(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id resep invalid", 400));
            }

            const recipe = await RecipeModel.showRecipe(req.params.id, true);
            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            if (recipe.status === "approved") {
                return next(new ErrorResponse("Resep sudah disetujui", 400));
            }

            const success = await AdminModel.approveRecipe(req.params.id, req.user.id);
            if (!success) {
                return next(new ErrorResponse("Resep gagal disetujui", 500));
            }

            const updatedRecipe = await RecipeModel.showRecipe(req.params.id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil disetujui",
                data: updatedRecipe,
            });
        } catch (error) {
            if (error.message.includes("disuspend")) {
                return next(new ErrorResponse(error.message, 403));
            }
            next(error);
        }
    }

    static async rejectRecipe(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id resep invalid", 400));
            }

            const recipe = await RecipeModel.showRecipe(req.params.id, true);
            if (!recipe) {
                return next(new ErrorResponse("Resep tidak ada", 404));
            }

            if (recipe.status === "rejected") {
                return next(new ErrorResponse("Resep sudah ditolak", 400));
            }

            const success = await AdminModel.rejectRecipe(
                req.params.id,
                req.user.id,
                req.body.reason || null,
            );
            if (!success) {
                return next(new ErrorResponse("Resep gagal ditolak", 500));
            }

            const updatedRecipe = await RecipeModel.showRecipe(req.params.id, true);

            res.status(200).json({
                success: true,
                message: "Resep berhasil ditolak",
                data: updatedRecipe,
            });
        } catch (error) {
            if (error.message.includes("disuspend")) {
                return next(new ErrorResponse(error.message, 403));
            }
            next(error);
        }
    }

    static async deleteRecipe(req, res, next) {
        try {
            if (isNaN(req.params.id)) {
                return next(new ErrorResponse("Id resep invalid", 400));
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
}

export default AdminController;
