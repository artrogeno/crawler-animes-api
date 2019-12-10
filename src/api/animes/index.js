import { BaseRouter } from '../../shared/base'
import { AnimesController } from './animes.controller'

export class AnimesRouter extends BaseRouter {
  constructor() {
    super(AnimesController)
    this.router.get(
      '/gateway',
      this.handler(AnimesController.prototype.gateway)
    )
    this.router.get(
      '/animes-online-br',
      this.handler(AnimesController.prototype.indexAnimesOnlineBr)
    )

    this.router.get(
      '/animes-online-br/:id',
      this.handler(AnimesController.prototype.findAnimesOnlineBr)
    )

    this.router.get(
      '/animes-online-br/:id/:category',
      this.handler(AnimesController.prototype.listOnAnimesOnlineBR)
    )
  }
}
