const cors = require("cors");

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const restrictedCors = (restricted = false) => {
  const errorMessage = "CORS Error: This origin is not allowed by CORS policy.";
  const statusCode = 403;

  return function (req, res, next) {
    const origin = req.get("origin");

    if (!restricted) {
      // Public route: allow all
      cors()(req, res, next);
    } else {
      // Restricted route: only allow allowedOrigins
      if (allowedOrigins.includes(origin)) {
        cors({ origin })(req, res, next);
      } else {
        console.log(`Blocked request from origin: ${origin || "no origin header"}`);
        res.status(statusCode).json({ error: errorMessage });
      }
    }
  };
};

module.exports = restrictedCors;