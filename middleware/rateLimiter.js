const rateLimit = require('express-rate-limit');

function createRateLimiter(options = {}) {
    return rateLimit({
        windowMs: options.windowMs || 10 * 1000, // default 10 seconds
        max: options.max || 10, // default 10 requests
        message: options.message || { error: 'Too many requests. Please wait a few seconds.' },
    });
}

module.exports = createRateLimiter;
