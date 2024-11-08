const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');  // Import the JWT library

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Set up the allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// Root route accessible to all
app.get('/', (req, res) => {
    res.status(200).json({ error: 'Nice try diddy.' });
});

// Helper function to normalize and sanitize username
function sanitizeUsername(username) {
    // Normalize and remove accents or special characters
    username = username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Remove non-alphanumeric characters
    username = username.replace(/[^A-Za-z0-9]/g, '');

    return username;
}

// Username sanitization route
app.get('/api/decancer', (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }

    // Sanitize the username
    const sanitizedUsername = sanitizeUsername(username);

    res.json({ username: sanitizedUsername });
});

// JWT Validation Middleware
function validateJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(403).json({ error: 'Token is required for authentication' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        
        // Attach the decoded user data to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route
    });
}

// Discord OAuth Routes accessible to all
app.get('/api/auth/discord', (req, res) => {
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const scope = 'identify email';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    res.redirect(discordAuthUrl);
});

app.get('/api/auth/discord/callback', async (req, res) => {
    const code = req.query.code;

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
        })
    });

    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });
        const userData = await userResponse.json();

        // Generate a JWT token for the user
        const token = jwt.sign({ id: userData.id, username: userData.username }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        // Redirect to frontend with JWT token
        const frontendUrl = 'https://cakeorpastry.netlify.app/testgpt';
        res.redirect(`${frontendUrl}/?token=${encodeURIComponent(token)}`);
    } else {
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

// Token validation route (for testing purposes)
app.get('/api/auth/discord/validateToken', validateJWT, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// CORS Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            console.log(`Blocked request from origin: ${origin}`);
            callback(new Error('CORS Error: This origin is not allowed by CORS policy.'));
        }
    }
}));

// Example restricted API route with JWT validation
app.get('/api/restricted', validateJWT, (req, res) => {
    // Access user data from the decoded token
    const user = req.user;
    res.json({ message: 'Welcome to the restricted route!', user });
});

// IP info route
app.get('/api/ipinfo', async (req, res) => {
    const ipInfoLink = 'https://ipinfo.io/json?token=' + process.env.IPINFO_TOKEN;
    try {
        const response = await fetch(ipInfoLink);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching IP info:', error);
        res.status(500).json({ error: 'Failed to fetch IP information.' });
    }
});

// TestGPT route
app.get('/api/testgpt', async (req, res) => {
    const question = req.query.question;
    const apiUrl = process.env.API_URL;

    if (!question) {
        return res.status(400).json({ error: 'Question parameter is required.' });
    }

    try {
        const response = await fetch(`${apiUrl}${encodeURIComponent(question)}`);

        // Check for non-OK responses before JSON parsing
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Non-OK response from API: ${errorText}`);
            return res.status(response.status).json({ error: 'Error from API endpoint.', details: errorText });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching TestGPT response:', error);
        res.status(500).json({ error: 'Failed to fetch response from TestGPT.' });
    }
});

// Webhook send route
app.get('/api/webhooksend', async (req, res) => {
    const { title, description, color } = req.query;
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!title || !description || !color) {
        return res.status(400).json({ error: 'Title, description, and color are required.' });
    }

    const embedMessage = {
        title: title,
        description: description,
        color: parseInt(color, 10)
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embedMessage] })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error sending webhook: ${errorText}`);
        }

        res.json({ message: 'Webhook sent successfully.' });
    } catch (error) {
        console.error('Error sending webhook:', error);
        res.status(500).json({ error: 'Failed to send webhook message.' });
    }
});