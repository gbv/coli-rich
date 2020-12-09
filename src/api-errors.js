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
