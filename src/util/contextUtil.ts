import { ContextType } from '@graphql/types'
import { Request } from 'express'
import { decodeSessionToken } from './authUtil'
import type { IncomingHttpHeaders } from 'http'

const buildContext = (headers: IncomingHttpHeaders): ContextType => {
    const authHeader = headers.authorization
    if (!authHeader)
        return {
            isLoggedIn: false,
        }

    const [type, token] = authHeader.split(' ')
    if (type !== 'Bearer') throw new Error('Wrong token type, not Bearer')

    const sessionPayload = decodeSessionToken(token)
    return {
        isLoggedIn: true,
        ...sessionPayload,
    }
}

export { buildContext }
