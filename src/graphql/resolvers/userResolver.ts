import {
    Arg,
    Args,
    ArgsType,
    Authorized,
    Field,
    InputType,
    Int,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql'

import { PaginatedUserResponse, User } from '@graphql/schemas/user'
import { MaxLength, ArrayMaxSize, Min } from 'class-validator'
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

@ArgsType()
class UsersArgs {
    @Field((type) => Int)
    @Min(0)
    cursor: number = 0
}

@Resolver(User)
class UserResolver {
    constructor() {}

    @Query((returns) => User)
    async user(
        @Arg('id', { nullable: true }) id?: string,
        @Arg('email', { nullable: true }) email?: string
    ) {
        if (email !== undefined) {
            const res = await userRepository.getUserByEmail(email)
            return res
        }
        if (id !== undefined) {
            const res = await userRepository.getUserById(id)
            return res
        }
        throw new Error('You must specify either email or id')
    }

    @Query((returns) => PaginatedUserResponse)
    async users(@Args() { cursor }: UsersArgs) {
        try {
            const res = await userRepository.getUsers()
            return res
        } catch (e) {
            console.log(e)
            throw e
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
