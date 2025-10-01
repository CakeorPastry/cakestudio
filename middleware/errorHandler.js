const requestError = require('./auxiliary/requestError');

// 404 handler
function notFoundHandler(req, res, next) {

  requestError({
    req,
    res,
    errorCode: 404,
  });
}

// General error handler middleware (500)
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = 500; /* (err.status || err.statusCode || 500;) */

  requestError({
    req,
    res,
    errorCode: statusCode,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
