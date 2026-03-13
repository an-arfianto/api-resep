import UserModel from "../models/userModel.js";
import RecipeModel from "../models/recipeModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ProfileController {
    // data profil
    static async getProfile(req, res) {
        try {
            const userId = req.user.id; // From JWT middleware
            const roleId = req.user.role_id; // From JWT middleware

            let profileData;

            // Get role-specific stats
            if (roleId === 1) {
                // Admin - just basic profile info (no stats needed)
                profileData = await UserModel.findById(userId);
            } else if (roleId === 2) {
                // Moderator - get dual stats (moderation activity + personal recipes)
                const userInfo = await UserModel.findById(userId);
                const moderatorStats = await RecipeModel.getModeratorProfileStats(userId);

                profileData = {
                    ...userInfo,
                    ...moderatorStats,
                };
            } else {
                // Regular User - get their recipe stats
                profileData = await UserModel.getUserStats(userId);
            }

            res.json({
                success: true,
                data: profileData,
            });
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to get profile",
            });
        }
    }

    // update profil
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { username } = req.body;

            if (!username || username.trim().length < 3) {
                return next(new ErrorResponse("Username minimal 3 huruf", 400));
            }

            const success = await UserModel.updateProfile(userId, username.trim());

            if (!success) {
                return next(new ErrorResponse("Profil gagal diupdate", 500));
            }

            const profile = await UserModel.findById(userId);
            delete profile.password;

            res.status(200).json({
                success: true,
                message: "Profile berhasil diupdate",
                data: profile,
            });
        } catch (error) {
            if (error.message === "Username telah terpakai") {
                return next(new ErrorResponse(error.message, 400));
            }
            next(error);
        }
    }

    // update password
    static async updatePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new ErrorResponse("Password sekarang dan password baru dibutuhkan", 400));
            }

            if (newPassword.length < 6) {
                return next(new ErrorResponse("Password baru minimal 6 huruf", 400));
            }

            const user = await UserModel.findByIdWithPassword(userId);
            const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password);

            if (!isValidPassword) {
                return next(new ErrorResponse("Password sekarang salah", 401));
            }

            const success = await UserModel.updatePassword(userId, newPassword);

            if (!success) {
                return next(new ErrorResponse("Password gagal diupdate", 500));
            }

            res.status(200).json({
                success: true,
                message: "Password berhasil diupdate",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProfileController;
