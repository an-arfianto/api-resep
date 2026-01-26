import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log error for debugging
	console.error("Error:", err);

	// MySQL duplicate entry
	if (err.code === "ER_DUP_ENTRY") {
		const message = "Data duplikat ditemukan";
		error = new ErrorResponse(message, 400);
	}

	// MySQL foreign key constraint
	if (err.code === "ER_NO_REFERENCED_ROW_2") {
		const message = "Referensi data tidak valid";
		error = new ErrorResponse(message, 400);
	}

	// JWT errors
	if (err.name === "JsonWebTokenError") {
		const message = "Token tidak valid";
		error = new ErrorResponse(message, 401);
	}

	if (err.name === "TokenExpiredError") {
		const message = "Token sudah kadaluarsa";
		error = new ErrorResponse(message, 401);
	}

	// Send response
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || "Server error",
	});
};

export default errorHandler;
