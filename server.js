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
    image: "https://cakeorpastry.netlify.app/Assets/Images/janko.png"
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

app.get("/math", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<link rel="stylesheet"
 href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">

<script defer
 src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js">
</script>

<script defer
 src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
 onload="renderMathInElement(document.body);">
</script>

<style>
body {
  margin: 0;
  background: #0f172a;
  color: white;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

.container {
  text-align: center;
}

svg {
  width: 300px;
  height: 300px;
  margin-bottom: 30px;
}

.hidden {
  opacity: 0;
}

.fade {
  animation: fadeIn 1.2s forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.draw-circle {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
</style>
</head>

<body>

<div class="container">

  <svg viewBox="-1 -1 2 2">
    <!-- Unit circle -->
    <circle id="circle"
      cx="0" cy="0" r="1"
      fill="none"
      stroke="white"
      stroke-width="0.02"
      class="draw-circle" />

    <!-- Triangle -->
    <line id="adj"
      x1="0" y1="0"
      x2="0.8" y2="0"
      stroke="cyan"
      stroke-width="0.02"
      class="hidden"/>

    <line id="opp"
      x1="0.8" y1="0"
      x2="0.8" y2="0.6"
      stroke="magenta"
      stroke-width="0.02"
      class="hidden"/>

    <line id="hyp"
      x1="0" y1="0"
      x2="0.8" y2="0.6"
      stroke="yellow"
      stroke-width="0.02"
      class="hidden"/>
  </svg>

  <div id="label1" class="hidden">
    \\[ \\cos\\theta = \\frac{adj}{1} \\]
  </div>

  <div id="label2" class="hidden">
    \\[ \\sin\\theta = \\frac{opp}{1} \\]
  </div>

  <div id="final" class="hidden" style="font-size:2.5rem; margin-top:20px;">
    \\[ \\sin^2\\theta + \\cos^2\\theta = 1 \\]
  </div>

</div>

<script>
setTimeout(() => {
  document.getElementById("adj").classList.remove("hidden");
  document.getElementById("adj").classList.add("fade");
}, 2000);

setTimeout(() => {
  document.getElementById("opp").classList.remove("hidden");
  document.getElementById("opp").classList.add("fade");
}, 3000);

setTimeout(() => {
  document.getElementById("hyp").classList.remove("hidden");
  document.getElementById("hyp").classList.add("fade");
}, 4000);

setTimeout(() => {
  document.getElementById("label1").classList.remove("hidden");
  document.getElementById("label1").classList.add("fade");
}, 5000);

setTimeout(() => {
  document.getElementById("label2").classList.remove("hidden");
  document.getElementById("label2").classList.add("fade");
}, 6000);

setTimeout(() => {
  document.getElementById("final").classList.remove("hidden");
  document.getElementById("final").classList.add("fade");
}, 7500);
</script>

</body>
</html>
`);
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});