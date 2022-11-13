import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Session } from '@graphql/schemas/session'
import CheckFiubaCredentialsMiddleware from '@graphql/middlewares/checkFIUBACredentialsMiddleware'
import { Credentials } from '@graphql/types'
import userRepository from '@repositories/userRepository'
import { createSessionToken } from '@util/authUtil'

@Resolver(Session)
class SessionResolver {
    constructor() {}

    @Mutation((returns) => Session)
    @UseMiddleware(CheckFiubaCredentialsMiddleware)
    async createSession(
        @Arg('credentials') credentials: Credentials
    ): Promise<Session> {
        const user = await userRepository.getUserByDNI(credentials.dni)
        const token = createSessionToken(user)
        return {
            token,
        }
    }
}

export { SessionResolver }