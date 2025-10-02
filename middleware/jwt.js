
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


/* USAGE ON SERVER
// server.js or app.js

const express = require('express');
const app = express();
const { signToken, validateJWT } = require('./middleware/jwt');
const restrictedCors = require('./middleware/restrictedCors'); // if you have this

// Example endpoint using validateJWT middleware
app.get('/api/auth/validatetoken', restrictedCors, validateJWT, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});

// Example usage of signToken
app.post('/api/auth/login', (req, res) => {
    const user = { id: 123, name: 'John Doe' }; // Normally you'd get this from a DB after auth
    const token = signToken(user, { expiresIn: '2h' });

    res.json({ token });
});
*/