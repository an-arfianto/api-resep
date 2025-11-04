import { insertUser, getUsers, updateUser, deleteUser, } from "../models/user-model";
import { validateUser } from "../utils/validation";
import ErrorResponse from "../utils/errorResponse";

// create user
export function createData(req, res, next) {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = "INSERT INTO users SET ?";

    // validasi
    var errors = validateUser(data);
    if (errors) {
        return next(new ErrorResponse(errors[0], 400));
    }

    // masukkan ke dalam model
    insertUser(res, querySql, data, next);
}

// show user
export function readData(req, res, next) {
    // buat query sql
    const querySql = "SELECT * FROM users";

    // masukkan ke dalam model
    getUsers(res, querySql, next);
}

// update user
export function updateData(req, res, next) {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = "SELECT * FROM users WHERE id = ?";
    const queryUpdate = "UPDATE users SET ? WHERE id = ?";

    // masukkan ke dalam model
    updateUser(res, querySearch, queryUpdate, req.params.id, data, next);
}

// delete user
export function deleteData(req, res, next) {
    // buat query sql untuk mencari data dan hapus
    const querySearch = "SELECT * FROM users WHERE id = ?";
    const queryDelete = "DELETE FROM users WHERE id = ?";

    // masukkan ke dalam model
    deleteUser(res, querySearch, queryDelete, req.params.id, next);
}
