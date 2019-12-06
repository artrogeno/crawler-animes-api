import { Router } from 'express'
import { AnimesRouter } from './animes'

export class ApiRouter {
  constructor() {
    this.router = Router()
    this.providerRoutes()
  }

  providerRoutes() {
    this.router.use('/animes', new AnimesRouter().router)
  }
}
