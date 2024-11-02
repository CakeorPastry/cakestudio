const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Set up the allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// General CORS middleware for restricted routes
app.use((req, res, next) => {
    if (req.path === '/auth/discord' || req.path === '/auth/discord/callback') {
        // Allow all origins for Discord login routes
        return cors()(req, res, next);
    } else {
        // Apply restricted CORS policy for other routes
        cors({
            origin: (origin, callback) => {
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    console.log(`Blocked request from origin: ${origin}`);
                    callback(new Error('CORS Error: This origin is not allowed by CORS policy.'));
                }
            }
        })(req, res, next);
    }
});

// Root route accessible to all
app.get('/', (req, res) => {
    res.status(200).json({ error: 'Nice try diddy.' });
});

// Restricted API routes
app.get('/api', (req, res) => {
    res.status(400).json({ error: 'Please specify a valid API endpoint.' });
});

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

app.get('/api/testgpt', async (req, res) => {
    const question = req.query.question;
    const apiUrl = process.env.API_URL;

    if (!question) {
        return res.status(400).json({ error: 'Question parameter is required.' });
    }

    try {
        const response = await fetch(`${apiUrl}${encodeURIComponent(question)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching TestGPT response:', error);
        res.status(500).json({ error: 'Failed to fetch response from TestGPT.' });
    }
});

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

// Discord OAuth Routes accessible to all
app.get('/auth/discord', (req, res) => {
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const scope = 'identify email';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    res.redirect(discordAuthUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
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

        currentUser = userData;

        res.redirect(`/login-success?user=${encodeURIComponent(JSON.stringify(userData))}`);
    } else {
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

app.get('/user', (req, res) => {
    if (currentUser) {
        res.json(currentUser);
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});