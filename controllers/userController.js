import UserModel from "../models/userModel.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";
import jwt from "jsonwebtoken";

class UserController {
    // register
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
            const user = await UserModel.findById(userId);

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

    // login
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;

            const user = await UserModel.findByUsername(username);
            if (!user) {
                return next(new ErrorResponse("Username atau password salah", 401));
            }

            const isValid = await UserModel.verifyPassword(password, user.password);
            if (!isValid) {
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

    // ambil data user
    static async getCurrentUser(req, res, next) {
        try {
            const user = await UserModel.findById(req.user.id);

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
