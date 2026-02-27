const errorHandler = (err, req, res, next) => {
    console.error('[Error]', err.stack || err.message);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
        return res.status(422).json({ success: false, message: 'Validation error', errors });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const status = err.statusCode || err.status || 500;
    return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
    });
};

module.exports = { errorHandler };
