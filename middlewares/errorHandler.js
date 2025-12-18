import { sendResponse } from "../utils/sendResponse.js";

export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    // 500 code untuk eror
    const statusCode = err.statusCode || 500;

    // pakai response helper agar struktur sama
    sendResponse(res, statusCode, {
        error: err.message,
    });
};
