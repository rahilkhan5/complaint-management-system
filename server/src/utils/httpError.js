// Create an Error that carries an HTTP status code.
// Throw it anywhere in a route handler and the error middleware sends it to the client.
export function httpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}
