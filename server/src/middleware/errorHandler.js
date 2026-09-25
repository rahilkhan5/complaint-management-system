// Express treats a middleware as an error handler only when it takes all 4 arguments
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500

  if (statusCode === 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Something went wrong on the server' : err.message,
  })
}
