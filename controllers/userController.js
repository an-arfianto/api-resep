import {
    insertUser,
    getUsers,
    updateUser,
    deleteUser,
} from "../models/userModel.js";
import { validateUser } from "../utils/validation.js";
import { sendResponse } from "../utils/sendResponse.js";
import ErrorResponse from "../utils/errorResponse.js";

// create user
export async function createData(req, res, next) {
    try {
        const data = req.body;

        // Validate request
        const errors = validateUser(data);
        if (errors) {
            return next(new ErrorResponse(errors[0], 400));
        }

        // Call model (handles hashing + DB insert)
        const user = await insertUser(data);

        // Respond
        sendResponse(res, 201, {
            message: "Berhasil insert data!",
            data: user,
        });
    } catch (err) {
        next(new ErrorResponse(err.message, 500));
    }
}

// show user
export async function readData(req, res, next) {
    try {
        const users = await getUsers();

        sendResponse(res, 200, { data: users });
    } catch (err) {
        next(new ErrorResponse(err.message, 500));
    }
}

// update user
export async function updateData(req, res, next) {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        const result = await updateUser(id, data);

        sendResponse(res, 200, { message: result.message });
    } catch (err) {
        next(new ErrorResponse(err.message, 500));
    }
}

// delete user
export async function deleteData(req, res, next) {
    try {
        const { id } = req.params;

        const result = await deleteUser(id);

        sendResponse(res, 200, { message: result.message });
    } catch (err) {
        next(new ErrorResponse(err.message, 500));
    }
}
