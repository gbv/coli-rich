export class HttpError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

export class RequestError extends HttpError {
  constructor(message) {
    super(message, 400)
  }
}

export class NotFoundError extends HttpError {
  constructor(message) {
    super(message, 404)
  }
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const error = {
    statusCode: err.statusCode || 500,
    message: err.message,
  }
  res.status(error.statusCode)
  res.json(error)
}
