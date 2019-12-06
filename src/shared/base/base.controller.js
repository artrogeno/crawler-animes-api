import BaseMessage from './base.message'
import { pickBy, identity } from 'lodash'

export class BaseController extends BaseMessage{
	constructor(req, res, next) {
		super()
		this.req = req
		this.res = res
		this.next = next
	}

	sendResponse({...params}) {
		let response = {}
		let { messages, data, status, token } = params
		if(messages) response.messages = messages
		if(data) response.data = data
		if(token) response.token = token
		this.res.status( status || 200 ).json(response)
		this.next()
	}

	sendError({...params}) {
		let { messages, status } = params
		if(!messages) messages = this.messages.UNAUTHORIZED_REQUEST
		this.res.status( status || 401 ).json({messages})
		this.next()
	}


	clearParams({...params}) {
		return pickBy(params, identity)
	}
}
