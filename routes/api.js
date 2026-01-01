const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { validateJWT } = require('../middleware/jwt');
const restrictedCors = require('../middleware/cors');
const createRateLimiter = require('../middleware/rateLimiter');
const sanitize = require('../auxiliary/sanitizer');

// GET /api/decancer - Sanitize single username (public, rate limited)
const decancerLimiter = createRateLimiter({ windowMs: 10 * 1000, max: 10 });
router.get('/decancer', decancerLimiter, (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required.' });
    }

    const sanitizedUsername = sanitize(username);
    res.json({ username: sanitizedUsername });
});

// GET /api/dehoist - Sanitize multiple usernames (public, rate limited)
const dehoistLimiter = createRateLimiter({ windowMs: 10 * 1000, max: 5 });
router.get('/dehoist', dehoistLimiter, (req, res) => {
    const queryParams = req.query;

    if (Object.keys(queryParams).length === 0) {
        return res.status(400).json({ error: 'At least one username parameter is required.' });
    }

    const sanitizedUsernames = {};

    for (const [key, value] of Object.entries(queryParams)) {
        // Handle array values by joining them into a single string
        const safeValue = Array.isArray(value) ? value.join(' ') : value || '';
        sanitizedUsernames[key] = sanitize(safeValue);
    }

    res.json(sanitizedUsernames);
});

// GET /api/testgpt - AI question endpoint (protected)
router.get('/testgpt', restrictedCors(true), validateJWT, async (req, res) => {
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

// GET /api/webhooksend - Send Discord webhook (protected)
router.get('/webhooksend', restrictedCors(true), async (req, res) => {
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

// GET /api/ipinfo - Get IP information (protected)
router.get('/ipinfo', restrictedCors(true), async (req, res) => {
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

module.exports = router;
