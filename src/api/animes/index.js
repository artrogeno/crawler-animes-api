import { BaseRouter } from '../../shared/base'
import { AnimesController } from './animes.controller'

export class AnimesRouter extends BaseRouter {
  constructor() {
    super(AnimesController)
    this.router.get('/', this.handler(AnimesController.prototype.index))
    // this.router.get('/:id/show',  this.handler(ChannelController.prototype.show))
  }
}
