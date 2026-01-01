const express = require('express');
require('dotenv').config();
const path = require('path');
const favicon = require('serve-favicon');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.png')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
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

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});