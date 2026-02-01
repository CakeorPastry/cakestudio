const DEFAULT_IMAGE = '/assets/privateSussyBotError.jpg';

const errorDictionary = {
  400: {
    message: "The server couldn't understand your request.",
    miniMessage: "You might have sent something weird or malformed."
  },
  403: {
    message: "You do not have permission to access this resource.",
    miniMessage: "The server understood the request but refuses to authorize it."
  },
  404: {
    message: "Page Not Found",
    miniMessage: "The page you are looking for does not exist."
  },
  500: {
    message: "Something went wrong on our end.",
    miniMessage: "The server encountered an unexpected error."
  }
};

function requestError({ req, res, errorCode = 500, title, message, miniMessage, image, debugMessage }) {
  const numericErrorCode = Number(errorCode) || 500;
  const errorDefaults = errorDictionary[numericErrorCode] || errorDictionary[500];

  const resolvedTitle = title || `${numericErrorCode} - Cake's Studio`;

  const resolvedMessage = message || errorDefaults.message || errorDictionary[500].message;
  const resolvedMini = miniMessage || errorDefaults.miniMessage || errorDictionary[500].miniMessage;

  const isValidImage = typeof image === 'string' && /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(image.trim());
  const resolvedImage = isValidImage ? image : DEFAULT_IMAGE;

  // Log error details to console (excluding 404s)
  if (numericErrorCode !== 404) {
    const iso = new Date().toISOString();
    const timestamp = new Date(iso).toLocaleString('en-US', {
  timeZone: 'Asia/Kolkata',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  weekday: 'long',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

const method = req.method;
    const url = req.originalUrl || req.url;
    const queryString = JSON.stringify(req.query);
    const logLevel = numericErrorCode >= 500 ? 'ERROR' : 'WARN';
    const logFunction = numericErrorCode >= 500 ? console.error : console.warn;

    let logMessage = `[${timestamp}] ${logLevel} ${numericErrorCode} ${method} ${url}`;
    logMessage += `\nMessage: ${resolvedMessage}`;
    logMessage += `\nMini: ${resolvedMini}`;
    if (debugMessage !== undefined) {
      logMessage += `\nDebug: ${debugMessage}`;
    }
    logMessage += `\nQuery: ${queryString}`;

    logFunction(logMessage);
  }

  res.status(numericErrorCode).render('error', {
    title: resolvedTitle,
    errorCode: numericErrorCode,
    message: resolvedMessage,
    minimessage: resolvedMini,
    image: resolvedImage,
    debugMessage: debugMessage
  });
}

module.exports = requestError;
