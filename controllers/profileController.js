import UserModel from "../models/userModel.js";
import ErrorResponse from "../utils/errorResponse.js";

class ProfileController {
    static async getProfile(req, res) {
        try {
            let profileData;

            if (req.user.role_id === 1) {
                profileData = await UserModel.findId(req.user.id);
            } else {
                profileData = await UserModel.showUserStats(req.user.id);
            }

            res.json({
                success: true,
                data: profileData,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Gagal mendapatkan data profil",
            });
        }
    }

    static async updateProfile(req, res, next) {
        try {
            if (!req.body.username || req.body.username.trim().length < 3) {
                return next(new ErrorResponse("Username minimal 3 huruf", 400));
            }

            const success = await UserModel.updateProfile(req.user.id, req.body.username.trim());

            if (!success) {
                return next(new ErrorResponse("Profil gagal diupdate", 500));
            }

            const profile = await UserModel.findId(req.user.id);
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

    static async updatePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return next(
                    new ErrorResponse("Password sekarang dan password baru dibutuhkan", 400),
                );
            }

            if (newPassword.length < 6) {
                return next(new ErrorResponse("Password baru minimal 6 huruf", 400));
            }

            const user = await UserModel.findUserWithPassword(req.user.id);
            const isValidPassword = await UserModel.verifyPassword(currentPassword, user.password);

            if (!isValidPassword) {
                return next(new ErrorResponse("Password sekarang salah", 401));
            }

            const success = await UserModel.updatePassword(req.user.id, newPassword);

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
