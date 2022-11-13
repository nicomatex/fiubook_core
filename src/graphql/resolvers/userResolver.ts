import {
    Arg,
    Args,
    ArgsType,
    Authorized,
    Field,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql'

import { PaginatedUserResponse, User } from '@graphql/schemas/user'
import userRepository from '@repositories/userRepository'
import CheckFiubaCredentialsMiddleware from '@graphql/middlewares/checkFIUBACredentialsMiddleware'
import { Credentials } from '@graphql/types'

@ArgsType()
class UsersArgs {
    @Field({ nullable: true })
    paginationToken?: string
}

@Resolver(User)
class UserResolver {
    constructor() {}

    @Query((returns) => User)
    async user(
        @Arg('id', { nullable: true }) id?: string,
        @Arg('dni', { nullable: true }) dni?: string
    ) {
        if (dni !== undefined) {
            const res = await userRepository.getUserByDNI(dni)
            return res
        }
        if (id !== undefined) {
            const res = await userRepository.getUserById(id)
            return res
        }
        throw new Error('You must specify either DNI or id')
    }

    @Query((returns) => PaginatedUserResponse)
    @Authorized(['ADMIN'])
    async users(@Args() { paginationToken }: UsersArgs) {
        try {
            const res = await userRepository.getUsers(paginationToken)
            return res
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    @Mutation((returns) => User)
    @UseMiddleware(CheckFiubaCredentialsMiddleware)
    async addUser(@Arg('credentials') credentials: Credentials): Promise<User> {
        try {
            const res = await userRepository.addUser(credentials.dni)
            return res
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error('DNI already in use')
            }
            throw err
        }
    }
}

export { UserResolver }
