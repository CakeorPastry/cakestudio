const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

app.get('/', (req, res) => {
    res.status(400).json({ error: 'Nice try diddy.' });
});

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`Blocked request from origin: ${origin}`);
            res.status(403).json({ error: 'This origin is not allowed by CORS policy.' });
            callback(new Error('CORS Error: This origin is not allowed by CORS policy.'));
        }
    }
}));

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
