const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Configure allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

// CORS middleware
//app.use(cors({
 //   origin: (origin, callback) => {
//        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
   //     } else {
//          callback(new Error('Not allowed by CORS')); // Deny the request
       // }
 //   
//}));

// Route for the root path
app.get('/', (req, res) => {
    res.status(400).json({ error: 'Nice try diddy.' });
});

app.get('/api', (req, res) => {
    res.status(400).json({ error: 'Please specify a valid API endpoint.' });
});

// Route for IP info
app.get('/api/ipinfo', async (req, res) => {
    const ipInfoLink = 'https://ipinfo.io/json?token=' + process.env.IPINFO_TOKEN; // Construct the URL with token
    try {
        const response = await fetch(ipInfoLink);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching IP info:', error);
        res.status(500).json({ error: 'Failed to fetch IP information.' });
    }
});

// Route for TestGPT
app.get('/api/testgpt', async (req, res) => {
    const question = req.query.question; // Retrieve question from query parameter
    const apiUrl = process.env.API_URL; // Use the API_URL for TestGPT

    if (!question) {
        return res.status(400).json({ error: 'Question parameter is required.' });
    }

    try {
        const response = await fetch(`${apiUrl}${encodeURIComponent(question)}`); // Append question to API_URL
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching TestGPT response:', error);
        res.status(500).json({ error: 'Failed to fetch response from TestGPT.' });
    }
});

// Route for sending a webhook message
app.post('/api/webhooksend', async (req, res) => {
    const { embedMessage } = req.body; // Get the embed message from the request body
    const webhookUrl = process.env.WEBHOOK_URL; // Use the webhook URL from environment variables

    if (!embedMessage) {
        return res.status(400).json({ error: 'Embed message is required.' });
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
