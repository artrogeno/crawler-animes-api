import httpResponse from '../constants/http.response'
import { HttpError } from '../services/http.error'

export class HandlerMiddleware extends HttpError {
  constructor() {
    super()
    this.messages = httpResponse
  }

  routerHandler(req, res, next) {
    if (!res.headersSent) {
      return next(new HttpError(this.messages.ROUTER_NOT_FOUND, 404))
    }
    next()
  }

  errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error)

    let messages = []
    if (error.errors && error.errors.length > 0) {
      error.errors.map(item => {
        if (item.messages) item.messages.map(msg => messages.push(msg))
      })
    } else {
      if (error.name === 'UnauthorizedError') {
        messages = this.messages.UNAUTHORIZED_REQUEST
      } else {
        messages = error.message || this.messages.INVALID_REQUEST
      }
    }
    return res.status(error.statusCode || 401).json({
      message: messages,
      data: error.data || '',
    })
  }
}
