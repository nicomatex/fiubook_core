import jwt from 'jsonwebtoken'
import config from '@config/default'
import { User } from '@graphql/schemas/user'

const createSessionToken = (user: User): string => {
    const tokenPayload = {
        userId: user.id,
        roles: user.roles,
    }

    const token = jwt.sign(tokenPayload, config.session.secret, {
        expiresIn: config.session.sessionDuration,
    })

    return token
}

export { createSessionToken }
