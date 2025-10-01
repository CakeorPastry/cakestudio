const cors = require("cors");

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

function restrictedCors(options = {}) {
  const {
    errorMessage = "CORS Error: This origin is not allowed by CORS policy.",
    statusCode = 403,
  } = options;

  return function (req, res, next) {
    const origin = req.get("origin");

    if (allowedOrigins.includes(origin)) {
      cors({ origin })(req, res, next);
    } else {
      console.log(`Blocked request from origin: ${origin}`);
      res.status(statusCode).json({ error: errorMessage });
    }
  };
}

module.exports = restrictedCors;

/*
const restrictedCors = require("./cors");

// Basic route with default message
app.get("/secret", restrictedCors(), (req, res) => {
  res.send("Secret data");
});

// Custom message + status code
app.get(
  "/only-html",
  restrictedCors({
    errorMessage: "Only /html is allowed. This endpoint does not return JSON.",
    statusCode: 406, // Not Acceptable
  }),
  (req, res) => {
    res.send("<h1>This is HTML only</h1>");
  }
);
*/
