import { BaseRouter } from '../../shared/base'
import { MangasController } from './mangas.controller'

export class MangasRouter extends BaseRouter {
  constructor() {
    super(MangasController)
    this.router.get(
      '/gateway',
      this.handler(MangasController.prototype.gateway)
    )
    this.router.get(
      '/manga-hosted',
      this.handler(MangasController.prototype.indexMangaHosted)
    )

    this.router.get(
      '/manga-hosted/:manga',
      this.handler(MangasController.prototype.listMangaHosted)
    )

    this.router.get(
      '/manga-hosted/:manga/chapter/:chapter',
      this.handler(MangasController.prototype.findMangaHosted)
    )

    // listMangaHosted

    // this.router.get(
    //   '/animes-online-br/:id',
    //   this.handler(MangasController.prototype.findAnimesOnlineBr)
    // )

    // this.router.get(
    //   '/animes-online-br/:id/:category',
    //   this.handler(MangasController.prototype.listOnAnimesOnlineBR)
    // )
  }
}
