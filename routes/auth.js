const express = require('express');
const router = express.Router();
const { signJWT, validateJWT } = require('../middleware/jwt');
const restrictedCors = require('../middleware/cors');

// GET /api/auth/login - Initiate Discord OAuth (public)
router.get('/login', (req, res) => {
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const scope = 'identify email';
    const redirect = req.query.redirect || '/';
    req.session.redirect = redirect;
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    res.redirect(discordAuthUrl);
});

// GET /api/auth/callback - Handle Discord OAuth callback (public)
router.get('/callback', async (req, res) => {
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

        const accessToken = signJWT(
            { id: userData.id, username: userData.username, email: userData.email, avatar: userData.avatar },
            '1d'
        );

        const redirectPath = req.session.redirect || '/';
        // req.session.destroy();  // Optional: Immediately free memory (maxAge handles expiry)
        const frontendUrl = 'https://cakeorpastry.netlify.app/auth/callback';
        res.redirect(`${frontendUrl}/?token=${encodeURIComponent(accessToken)}&redirect=${encodeURIComponent(redirectPath)}`);
    } else {
        res.status(500).json({ error: 'Failed to authenticate with Discord' });
    }
});

// GET /api/auth/validatetoken - Validate JWT token
router.get('/validatetoken', restrictedCors(true), validateJWT, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});

module.exports = router;
