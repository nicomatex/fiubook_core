/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import {
    Arg,
    Authorized,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';

import { PaginatedUserResponse, User } from '@graphql/schemas/user';
import userRepository from '@repositories/userRepository';
import CheckFiubaCredentialsGuard from '@graphql/middlewares/checkFIUBACredentialsMiddleware';
import { Credentials } from '@graphql/types';

@Resolver()
class UserResolver {
    @Query(() => User)
    @Authorized(['ADMIN'])
    async user(
        @Arg('id', { nullable: true }) id?: string,
        @Arg('dni', { nullable: true }) dni?: string,
    ) {
        if (dni !== undefined) {
            const res = await userRepository.getUserByDNI(dni);
            return res;
        }
        if (id !== undefined) {
            const res = await userRepository.getUserById(id);
            return res;
        }
        throw new Error('You must specify either DNI or id');
    }

    @Query(() => PaginatedUserResponse)
    @Authorized(['ADMIN'])
    async users(
        @Arg('pagination_token', { nullable: true }) paginationToken?: string,
        @Arg('page_size', { nullable: true }) pageSize?: number,
    ) {
        const res = await userRepository.getUsers(paginationToken, pageSize);
        return res;
    }

    @Mutation(() => User)
    @UseMiddleware(CheckFiubaCredentialsGuard)
    async addUser(@Arg('credentials') credentials: Credentials): Promise<User> {
        try {
            const res = await userRepository.addUser(credentials.dni);
            return res;
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error('DNI already in use');
            }
            throw err;
        }
    }
}

export default UserResolver;
