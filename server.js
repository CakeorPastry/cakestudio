const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Nice try diddy');
});

// Add /api route that uses your environment variables
app.get('/api', (req, res) => {
    const ipInfoLink = process.env.IPINFO_LINK || 'No IP info link found';
    res.json({ message: `Your API URL is: ${ipInfoLink}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
