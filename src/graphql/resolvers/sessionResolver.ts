import {
    Arg,
    Field,
    InputType,
    Mutation,
    Resolver,
    UseMiddleware,
} from 'type-graphql'

import { MaxLength } from 'class-validator'
import { Session } from '@graphql/schemas/session'
import CheckFiubaCredentialsMiddleware from '@graphql/middlewares/checkFIUBACredentialsMiddleware'
import { Credentials } from '@graphql/types'

@Resolver(Session)
class SessionResolver {
    constructor() {}

    @Mutation((returns) => Session)
    @UseMiddleware(CheckFiubaCredentialsMiddleware)
    async createSession(
        @Arg('credentials') credentials: Credentials
    ): Promise<Session> {
        return {
            token: 'falopa-123-456',
        }
    }
}

export { SessionResolver }
