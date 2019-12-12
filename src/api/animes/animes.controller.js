import { BaseController } from '../../shared/base'
import {
  listGateway,
  getAnimesOnlineBR,
  findEpOnAnimesOnlineBR,
  listEpisodesOnAnimesOnlineBR,
} from './animes.model'

export class AnimesController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next)
  }

  gateway() {
    const data = listGateway()
    let messages = this.messages.GATEWAY_LIST_SUCCESS
    this.sendResponse({ data, messages })
  }

  async indexAnimesOnlineBr() {
    const { page } = this.req.query
    const data = await getAnimesOnlineBR(page)

    let messages = this.messages.ANIMES_ONLINE_BR_GET_SUCCESS
    this.sendResponse({ data, messages })
  }

  async findAnimesOnlineBr() {
    const { id } = this.req.params
    const data = await findEpOnAnimesOnlineBR(id)
    let messages = this.messages.ANIMES_ONLINE_BR_FIND_SUCCESS
    this.sendResponse({ data, messages })
  }

  async listOnAnimesOnlineBR() {
    const { id, category } = this.req.params
    const data = await listEpisodesOnAnimesOnlineBR(id, category)
    let messages = this.messages.ANIMES_ONLINE_BR_LIST_SUCCESS
    this.sendResponse({ data, messages })
  }
}
