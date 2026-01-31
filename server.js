const express = require('express');
require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.set('trust proxy', true);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.png')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,  // Don't save empty sessions
    cookie: {
        secure: false,  // Set to true in production with HTTPS
        maxAge: 5 * 60 * 1000  // 5 minutes expiry
    }
}));

// Environment config
process.env.YTDL_NO_UPDATE = "1";

// Global CORS middleware
const restrictedCors = require('./middleware/cors');
app.use(restrictedCors());

// Error handlers
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Utilities
const requestError = require('./auxiliary/requestError');

// Route imports
const ytRoutes = require('./routes/yt');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Root/test routes
app.get("/NIKHIL", (req, res) => {
  requestError({
    req,
    res,
    message: "NOT ACCEPTABLE 💀",
    minimessage: "Sorry, you're not a mastermind. This is for testing purposes.",
    errorCode: 406,
    debugMessage: "Unexpected Manipur Nibba",
    image: ""
  });
});

app.get('/', (req, res) => {
    res.status(200).json({ error: 'Nice try diddy.' });
});

app.get('/api', (req, res) => {
    res.status(400).json({ error: 'Please provide a valid API endpoint.' });
});

app.get('/assets', (req, res) => {
     res.status(400).json({ error: 'Please provide a valid asset name.' });
});

app.get('/err', (req, res) => {
    console.log(LOL);
});

// Mount API routes
app.use('/api/yt', ytRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);


/* TEST */
app.get("/testId", async (req, res) => {
  const userId = req.query.id; // get ?id= from URL

  if (!userId) {
    return res.status(400).json({ error: "Missing id parameter" });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "User not found or inaccessible" });
    }

    const user = await response.json();

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

    // temporary test
console.log(JSON.stringify(user, null, 2));

    res.json({
      id: user.id,
      username: user.username,
      global_name: user.global_name,
      avatar: avatarUrl,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});
// ---

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});