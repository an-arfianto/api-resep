import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // log error
    console.error("Error:", err);

    // duplicate entry
    if (err.code === "ER_DUP_ENTRY") {
        const message = "Data duplikat ditemukan";
        error = new ErrorResponse(message, 400);
    }

    // foreign key constraint
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
        const message = "Referensi data tidak valid";
        error = new ErrorResponse(message, 400);
    }

    // JWT eror
    if (err.name === "JsonWebTokenError") {
        const message = "Token tidak valid";
        error = new ErrorResponse(message, 401);
    }

    // JWT kadaluarsa
    if (err.name === "TokenExpiredError") {
        const message = "Token sudah kadaluarsa";
        error = new ErrorResponse(message, 401);
    }

    // response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server eror",
    });
};

export default errorHandler;
