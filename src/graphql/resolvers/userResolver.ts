import {
    Arg,
    Authorized,
    Field,
    InputType,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql'

import { User } from '@graphql/schemas/user'
import { MaxLength, Length, ArrayMaxSize } from 'class-validator'
import userRepository from '@repositories/userRepository'

@InputType()
class NewUserInput {
    @Field()
    @MaxLength(128)
    email!: string

    @Field((type) => [String])
    @ArrayMaxSize(3)
    roles!: string[]
}

@Resolver(User)
class UserResolver {
    constructor() {}

    @Query((returns) => User)
    async user(
        // @Arg('id', { nullable: true }) id?: string,
        @Arg('email', { nullable: true }) email?: string
    ) {
        if (email !== undefined) {
            const res = await userRepository.getUserByEmail(email)
            console.log(res)
            return res
        }
    }

    @Mutation((returns) => User)
    // @Authorized()
    async addUser(
        @Arg('newUserData') newUserData: NewUserInput
    ): Promise<User> {
        try {
            const res = await userRepository.addUser(
                newUserData.email,
                newUserData.roles
            )
            return res
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error('Email already in use')
            }
            throw err
        }
    }
}

export { UserResolver }
