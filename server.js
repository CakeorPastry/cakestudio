const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

// Set up session management (Render should handle these without explicit setup)
app.use(passport.initialize());

// Configure Passport with Discord Strategy
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI,
    scope: ['identify', 'email'] // Scopes for retrieving user information
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialize user info (can be simplified if sessions aren’t necessary)
passport.serializeUser((user, done) => {
    done(null, user);
});

// Discord login route
app.get('/auth/discord', passport.authenticate('discord'));

// Discord callback route
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.send(`<h1>Logged in with Discord as ${req.user.username}#${req.user.discriminator}</h1>`);
});