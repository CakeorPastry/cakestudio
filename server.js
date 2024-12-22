const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const path = require('path');
const unidecode = require('unidecode');
const favicon = require('serve-favicon');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.png')));

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

function restrictedCors(req, res, next) {
    const origin = req.get('origin');
    if (allowedOrigins.includes(origin)) {
        cors()(req, res, next);
    } else {
        console.log(`Blocked request from origin: ${origin}`);
        res.status(403).json({ error: 'CORS Error: This origin is not allowed by CORS policy.' });
    }
}

function sanitizeUsername(username) {
    // Store the original username for logging
    const originalUsername = username;

    // Step 1: Normalize and remove diacritical marks
    username = username.normalize('NFKC').replace(/[\u0300-\u036f]/g, '');

    // Step 2: Remove unsupported Unicode ranges (e.g., emojis, symbols)
    username = username.replace(/[\u2000-\u2BFF\u3000-\uD7FF\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');

    // Step 3: Apply unidecode to remove special Unicode characters
    username = unidecode(username);

    // Step 4: Replace duplicate spaces with a single space
    username = username.replace(/\s+/g, ' ');

    // Step 5: Final cleanup to allow only alphanumeric characters and spaces
    username = username.replace(/[^A-Za-z0-9 ]/g, '');

    // Step 6: Trim leading and trailing spaces
    username = username.trim();

    // Log original and sanitized usernames
    console.log(`Original: "${originalUsername}",
Sanitized: "${username}"`);

    if (username == '') {
    username = "Empty Name";
}

    if (username.length > 29) {
    username = username.slice(0, 29) + '...';
}

    return username;
}

function validateJWT(req, res, next) {
    const token = req.query.token;

    if (!token) {
        return res.status(403).json({ error: 'Token is required for authentication' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
console.error(`Failed to verify JWT. 
Error : ${err}
Decoded JWT : ${decoded}
Token : ${token}`)
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
}

app.get('/', (req, res) => {
    res.status(200).json({ error: 'Nice try diddy.' });
});

app.get('/api', (req, res) => {
    res.status(400).json({ error: 'Please provide a valid API endpoint.' });
});

const decancerLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 10, // 10 requests per 10 seconds
    message: { error: 'Too many requests. Please wait a few seconds.' },
});

app.get('/api/decancer', decancerLimiter, (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }

    const sanitizedUsername = sanitizeUsername(username);
    res.json({ username: sanitizedUsername });
});

const dehoistLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 5, // 2 requests per 10 seconds
    message: { error: 'Too many requests. Please wait a few seconds.' },
});

app.get('/api/dehoist', dehoistLimiter, (req, res) => {
    const queryParams = req.query;

    if (Object.keys(queryParams).length === 0) {
        return res.status(400).json({ error: 'At least one username parameter is required.' });
    }

    const sanitizedUsernames = {};

    for (const [key, value] of Object.entries(queryParams)) {
        // Handle array values by joining them into a single string
        const safeValue = Array.isArray(value) ? value.join(' ') : value || '';
        sanitizedUsernames[key] = sanitizeUsername(safeValue);
    }

    res.json(sanitizedUsernames);
});

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

        const accessToken = jwt.sign(
            { id: userData.id, username: userData.username, email: userData.email, avatar: userData.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const frontendUrl = 'https://cakeorpastry.netlify.app/testgpt';
        res.redirect(`${frontendUrl}/?token=${encodeURIComponent(accessToken)}`);
    } else {
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

app.get('/api/auth/validatetoken', validateJWT, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});

app.get('/api/testgpt', restrictedCors, validateJWT, async (req, res) => {
    const question = req.query.question;
    const apiUrl = process.env.API_URL;

    if (!question) {
        return res.status(400).json({ error: 'Question parameter is required.' });
    }

    try {
        const response = await fetch(`${apiUrl}${encodeURIComponent(question)}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Non-OK response from API: ${errorText}`);
            return res.status(response.status).json({ error: 'Error from API endpoint.', details: errorText });
        }

        const data = await response.json();

        // Check for expected structure and return the formatted response
        if (data.status && Array.isArray(data.result) && data.result[0]?.response) {
            return res.json({ reply: data.result[0].response });
        } else {
            console.error('Unexpected API response structure:', data);
            return res.status(500).json({ error: 'Unexpected API response structure.' });
        }
    } catch (error) {
        console.error('Error fetching TestGPT response:', error);
        res.status(500).json({ error: 'Failed to fetch response from TestGPT.' });
    }
});

app.get('/api/webhooksend', restrictedCors, async (req, res) => {
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

app.get('/api/ipinfo', restrictedCors, async (req, res) => {
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

app.get('/assets', (req, res) => {
     res.status(400).json({ error: 'Please provide a valid asset name.' });
});

app.get('/test-error', (req, res) => {
  res.render('error', {
    title: 'Test - Cake\'s Studio',
    errorCode: 'TEST',
    message: 'This is a test page',
    minimessage: 'Testing error.ejs rendering'
  });
});

app.get('/err', (req, res) => {
    console.log(LOL);
});

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error details for debugging

    let statusCode = err.status || 500;
    let message = 'Internal Server Error';
    let minimessage = 'The server encountered an unexpected error which prevented it from fulfilling the request.';
    
    if (statusCode === 403) {
        message = 'Forbidden';
        minimessage = 'You do not have permission to access this resource.';
    } else if (statusCode === 500) {
        message = 'Internal Server Error';
        minimessage = 'The server encountered an unexpected error which prevented it from fulfilling the request.';
    }

    res.status(statusCode).render('error', { 
        title: `${statusCode} - Cake\'s Studio`, 
        errorCode: statusCode,
        message: message,
        minimessage: minimessage
    });
});

app.get('*', (req, res) => {
  console.log(`Wildcard route triggered for URL: ${req.originalUrl}`);
  res.status(404).render('error', {
    title: '404 - Cake\'s Studio',
    errorCode: '404',
    message: 'Page Not Found',
    minimessage: 'The page you are looking for does not exist.'
  });
});

// Old API_URL = "https://hercai.onrender.com/v3/hercai?question="


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});