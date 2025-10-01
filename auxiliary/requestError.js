const DEFAULT_IMAGE = '/assets/privateSussyBotError.jpg';

// Error database
const errorDictionary = {
  400: {
    title: 'Bad Request',
    message: 'The server couldn’t understand your request.',
    miniMessage: 'You might have sent something weird or malformed.'
  },
  403: {
    title: 'Forbidden',
    message: 'You do not have permission to access this resource.',
    miniMessage: 'The server understood the request but refuses to authorize it.'
  },
  404: {
    title: 'Not Found',
    message: 'The page you’re looking for doesn’t exist.',
    miniMessage: 'Check the URL or go back to safety.'
  },
  500: {
    title: 'Internal Server Error',
    message: 'Something went wrong on our end.',
    miniMessage: 'The server encountered an unexpected error.'
  },

};

function requestError({
  req,
  res,
  errorCode = 500,
  title,
  message,
  miniMessage,
  image
}) {
  const errorDefaults = errorDictionary[errorCode] || errorDictionary[500];

  // Use provided values or fallback to defaults
  const resolvedTitle = title || errorDefaults.title || String(errorCode);
  const resolvedMessage = message || errorDefaults.message || errorDictionary[500].message;
  const resolvedMini = miniMessage || errorDefaults.miniMessage || errorDictionary[500].miniMessage;

  // Check image validity (basic check — you can improve it)
  const isValidImage = typeof image === 'string' && image.trim().length > 5 && image.includes('/');
  const resolvedImage = isValidImage
    ? image
    : errorDefaults.image || DEFAULT_IMAGE;

  res.status(errorCode).render('error', {
    title: `${errorCode} - Cake's Studio`,
    errorCode,
    message: resolvedMessage,
    minimessage: resolvedMini,
    image: resolvedImage,
  });
}

module.exports = requestError;
