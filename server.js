const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.get('/test-error', (req, res) => {
  res.render('error', {
    title: 'Test - Cake\'s Studio',
    errorCode: 'TEST',
    message: 'This is a test page',
    minimessage: 'Testing error.ejs rendering'
  });
});

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
    username = username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    username = username.replace(/[^A-Za-z0-9]/g, '');
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

app.get('/api/decancer', (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }

    const sanitizedUsername = sanitizeUsername(username);
    res.json({ username: sanitizedUsername });
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
            { expiresIn: '1m' }
        );

        const frontendUrl = 'https://cakeorpastry.netlify.app/testgpt';
        res.redirect(`${frontendUrl}/?token=${encodeURIComponent(accessToken)}`);
    } else {
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

app.get('/api/auth/validatetoken', restrictedCors, validateJWT, (req, res) => {
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
        res.json(data);
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

app.get('*', (req, res) => {
  res.status(404).render('error', {
    title: '404 - Cake\'s Studio',
    errorCode: '404',
    message: 'Page Not Found',
    miniMessage: 'The page you are looking for does not exist.'
  });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});