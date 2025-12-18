export const sendResponse = (res, status, payload = {}) => {
    res.status(status).json({
        success: status < 400, // true if 2xx or 3xx
        ...payload,
    });
};
