// Centralized error handler
export function notFound(req, res, next) {
    return res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
    // Default to 500
    let status = err.statusCode || 500;
    let message = err.message || 'Server error';

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }
    // Handle bad ObjectId
    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid identifier format';
    }
    // Handle duplicate key (email unique)
    if (err.code === 11000) {
        status = 400;
        const fields = Object.keys(err.keyValue || {}).join(', ');
        message = `Duplicate value for field(s): ${fields}`;
    }

    // Auth-related
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401;
    }

    return res.status(status).json({ success: false, message });
}
