
const jwt = require('jsonwebtoken');

function signJWT(payload, options = {}) {
    const {
        expiresIn = '1h',
        secret = process.env.JWT_SECRET
    } = options;

    return jwt.sign(payload, secret, { expiresIn });
}

function validateJWT(req, res, next) {
    const token = req.query.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token is required for authentication' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error(`Failed to verify JWT. 
Error : ${err}
Decoded JWT : ${decoded}
Token : ${token}`);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = {
    signJWT,
    validateJWT
};
