import { Router } from 'express'

export class BaseRouter {

	constructor(controller) {
		this.controller = controller
		this.router = Router()
	}

  handler(action) {
		return (req, res, next) => action.call(new this.controller(req, res, next))
	}
}
