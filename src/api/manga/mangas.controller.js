import { BaseController } from '../../shared/base'
import {
  listGateway,
  getMangaHosted,
  listChaptersMangaHosted,
  findChaptersMangaHosted,
  searchMangaOnMangaHosted,
} from './mangas.model'

export class MangasController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next)
  }

  gateway() {
    const data = listGateway()
    let messages = this.messages.GATEWAY_LIST_SUCCESS
    this.sendResponse({ data, messages })
  }

  async indexMangaHosted() {
    const { page } = this.req.query
    const data = await getMangaHosted(page)

    let messages = this.messages.MANGA_HOSTED_GET_SUCCESS
    this.sendResponse({ data, messages })
  }

  async listMangaHosted() {
    const { manga } = this.req.params
    const data = await listChaptersMangaHosted(manga)
    let messages = this.messages.MANGA_HOSTED_LIST_SUCCESS
    this.sendResponse({ data, messages })
  }

  async findMangaHosted() {
    const { manga, chapter } = this.req.params
    const data = await findChaptersMangaHosted(manga, chapter)
    let messages = this.messages.MANGA_HOSTED_FIND_SUCCESS
    this.sendResponse({ data, messages })
  }

  async searchMangaHosted() {
    const { search } = this.req.params
    const data = await searchMangaOnMangaHosted(search)
    let messages = this.messages.MANGA_HOSTED_SEARCH_SUCCESS
    this.sendResponse({ data, messages })
  }

  // async findAnimesOnlineBr() {
  //   const { id } = this.req.params
  //   const data = await findEpOnAnimesOnlineBR(id)
  //   let messages = this.messages.ANIMES_ONLINE_BR_FIND_SUCCESS
  //   this.sendResponse({ data, messages })
  // }
}
