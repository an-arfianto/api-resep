import UserModel from "../models/userModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ProfileController {
    /*
     * Get current user profile with stats
     */
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await UserModel.getUserStats(userId);

            if (!profile) {
                return next(new ErrorResponse("User not found", 404));
            }

            // Remove sensitive data
            delete profile.password;

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    /*
     * Update profile (username)
     */
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { username } = req.body;

            if (!username || username.trim().length < 3) {
                return next(new ErrorResponse("Username must be at least 3 characters", 400));
            }

            const success = await UserModel.updateProfile(userId, username.trim());

            if (!success) {
                return next(new ErrorResponse("Failed to update profile", 500));
            }

            // Get updated profile
            const profile = await UserModel.findById(userId);
            delete profile.password;

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: profile,
            });
        } catch (error) {
            if (error.message === "Username already taken") {
                return next(new ErrorResponse(error.message, 400));
            }
            next(error);
        }
    }

    /*
     * Update password
     */
    static async updatePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(new ErrorResponse("Current and new password are required", 400));
            }

            if (newPassword.length < 6) {
                return next(new ErrorResponse("New password must be at least 6 characters", 400));
            }

            // Verify current password
            const user = await UserModel.findByIdWithPassword(userId);
            const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password);

            if (!isValidPassword) {
                return next(new ErrorResponse("Current password is incorrect", 401));
            }

            // Update password
            const success = await UserModel.updatePassword(userId, newPassword);

            if (!success) {
                return next(new ErrorResponse("Failed to update password", 500));
            }

            res.status(200).json({
                success: true,
                message: "Password updated successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProfileController;
