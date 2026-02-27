const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const paginate = (query, page = 1, limit = 20) => {
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    return { skip, limit: parseInt(limit) };
};

const paginationMeta = (total, page, limit) => ({
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
});

module.exports = { generateToken, generateRandomToken, paginate, paginationMeta };
