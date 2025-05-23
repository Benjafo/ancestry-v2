const rateLimit = require('express-rate-limit');

// Auth rate limiter - stricter limits for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        message: 'Too many authentication attempts, please try again later'
    }
});

// API rate limiter - general limits for API endpoints
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests, please try again later'
    }
});

module.exports = {
    authLimiter,
    apiLimiter
};
