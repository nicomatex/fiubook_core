import { Arg, Field, InputType, Mutation, Resolver } from 'type-graphql'

import { MaxLength } from 'class-validator'
import { Session } from '@graphql/schemas/session'
import userRepository from '@repositories/userRepository'
import { checkFiubaCredentials } from '@util/authUtil'

@InputType()
class Credentials {
    @Field()
    @MaxLength(128)
    dni!: string

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
        // Check fiuba credentials first
        const isFiubaUser = await checkFiubaCredentials(
            credentials.dni,
            credentials.password
        )
        if (!isFiubaUser) {
            // TODO mejorar este error
            throw new Error("You're not a FIUBA user or the password is wrong")
        }

        return {
            token: 'falopa-123-456',
        }
    }
}

export { SessionResolver }
