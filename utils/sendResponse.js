/*
 * Standardized response sender
 */
export function sendResponse(res, statusCode, data) {
    res.status(statusCode).json({
        success: true,
        ...data,
    });
}
