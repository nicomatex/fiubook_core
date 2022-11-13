import { Arg, Field, InputType, Mutation, Resolver } from 'type-graphql'

import { MaxLength } from 'class-validator'
import { Session } from '@graphql/schemas/session'
import userRepository from '@repositories/userRepository'

@InputType()
class Credentials {
    @Field()
    @MaxLength(128)
    email!: string

    @Field()
    @MaxLength(128)
    password!: string
}

@Resolver(Session)
class SessionResolver {
    constructor() {}

    @Mutation((returns) => Session)
    async createSession(
        @Arg('credentials') credentials: Credentials
    ): Promise<Session> {
        const user = userRepository.getUserByEmail(credentials.email)

        return {
            token: 'falopa-123-456',
        }
    }
}

export { SessionResolver }
