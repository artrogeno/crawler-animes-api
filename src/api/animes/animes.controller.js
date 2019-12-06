import { BaseController } from '../../shared/base'

export class AnimesController extends BaseController {
  constructor(req, res, next) {
    super(req, res, next)
  }

  index() {
    let messages, data
    data = { anime: 'test' }
    messages = this.messages.CHANNEL_CREATED_SUCCESS
    this.sendResponse({ data, messages })
  }
}
