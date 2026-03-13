// custom error response
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
    }
}

export default ErrorResponse;
