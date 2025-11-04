const conn = require("../config/database");
const { responseData, responseMessage } = require("../utils/response-handler");
const ErrorResponse = require("../utils/errorResponse");

// insert bootcamp
exports.insertUser = (response, statement, data, next) => {
    // jalankan query
    conn.query(statement, data, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika request berhasil
        responseMessage(response, 201, "Berhasil insert data!");
    });
};

// get data bootcamp
exports.getUsers = (response, statement, next) => {
    // jalankan query
    conn.query(statement, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika request berhasil
        responseData(response, 200, rows);
    });
};

// update data bootcamp
exports.updateUser = (
    response,
    searchStatement,
    updateStatement,
    id,
    data,
    next,
) => {
    // jalankan query untuk melakukan pencarian data
    conn.query(searchStatement, id, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            conn.query(updateStatement, [data, id], (err, rows, field) => {
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
};

// delete bootcamp
exports.deleteUser = (response, searchStatement, deleteStatement, id, next) => {
    // jalankan query untuk melakukan pencarian data
    conn.query(searchStatement, id, (err, rows, field) => {
        // error handling
        if (err) {
            return next(new ErrorResponse(err.message, 500));
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            conn.query(deleteStatement, id, (err, rows, field) => {
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
};
