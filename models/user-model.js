import { query } from "../config/database";
import { responseData, responseMessage } from "../utils/response-handler";
import ErrorResponse from "../utils/errorResponse";

// insert user
export function insertUser(response, statement, data, next) {
    // jalankan query
    query(statement, data, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika request berhasil
        responseMessage(response, 201, "Berhasil insert data!");
    });
}

// get data user
export function getUsers(response, statement, next) {
    // jalankan query
    query(statement, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika request berhasil
        responseData(response, 200, rows);
    });
}

// update data user
export function updateUser(
    response,
    searchStatement,
    updateStatement,
    id,
    data,
    next,
) {
    // jalankan query untuk melakukan pencarian data
    query(searchStatement, id, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            query(updateStatement, [data, id], (err, rows, field) => {
                // error handling
                if (err) {
                    return next(new ErrorResponse(err.message, 500));
                }

                // jika update berhasil
                responseMessage(response, 200, "Berhasil update data!");
            });
        } else {
            return next(new ErrorResponse("Data tidak ditemukan!", 500));
        }
    });
}

// delete user
export function deleteUser(response, searchStatement, deleteStatement, id, next) {
    // jalankan query untuk melakukan pencarian data
    query(searchStatement, id, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            query(deleteStatement, id, (err, rows, field) => {
                // error handling
                if (err) {
                    return next(new ErrorResponse(err.message, 500));
                }

                // jika delete berhasil
                responseMessage(response, 200, "Berhasil hapus data!");
            });
        } else {
            return next(new ErrorResponse("Data tidak ditemukan!", 500));
        }
    });
}
