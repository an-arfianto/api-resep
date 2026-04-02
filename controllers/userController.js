import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import ErrorResponse from "../utils/errorResponse.js";
import { sendResponse } from "../utils/sendResponse.js";

class UserController {
    static async register(req, res, next) {
        try {
            const { username, password, role_id } = req.body;

            const exists = await UserModel.usernameExists(username);
            if (exists) {
                return next(new ErrorResponse("Username sudah digunakan", 400));
            }

            const userId = await UserModel.createUser({
                username,
                password,
                role_id,
            });
            const user = await UserModel.findId(userId);

            const token = jwt.sign(
                { id: user.id, username: user.username, role_id: user.role_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
            );

            sendResponse(res, 201, {
                message: "Registrasi berhasil",
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        role_id: user.role_id,
                        role_name: user.role_name,
                    },
                    token,
                },
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async login(req, res, next) {
        try {
            const { username, password } = req.body;

            const user = await UserModel.findUsername(username);
            if (!user) {
                return next(new ErrorResponse("Username atau password salah", 401));
            }

            const valid = await UserModel.verifyPassword(password, user.password);
            if (!valid) {
                return next(new ErrorResponse("Username atau password salah", 401));
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role_id: user.role_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
            );

            sendResponse(res, 200, {
                message: "Login berhasil",
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        role_id: user.role_id,
                        role_name: user.role_name,
                    },
                    token,
                },
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }

    static async showUser(req, res, next) {
        try {
            const user = await UserModel.findId(req.user.id);

            if (!user) {
                return next(new ErrorResponse("User tidak ditemukan", 404));
            }

            sendResponse(res, 200, {
                message: "User ditemukan",
                data: user,
            });
        } catch (err) {
            next(new ErrorResponse(err.message, 500));
        }
    }
}

export default UserController;
