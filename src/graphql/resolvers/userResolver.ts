/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import {
    Arg,
    Authorized,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';

import {
    PaginatedUserResponse,
    UpdateUserArgs,
    User,
} from '@graphql/schemas/user';
import userRepository from '@repositories/userRepository';
import CheckFiubaCredentialsGuard from '@graphql/middlewares/checkFIUBACredentialsMiddleware';
import { Credentials, LoggedInContextType } from '@graphql/types';
import { createError } from '@errors/errorParser';

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
        throw createError(400, 'You must specify either DNI or id');
    }

    @Query(() => PaginatedUserResponse)
    @Authorized(['ADMIN'])
    async users(
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
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
                throw createError(409, 'DNI already in use');
            }
            throw err;
        }
    }

    @Mutation(() => User)
    @Authorized(['ADMIN'])
    async updateUser(
        @Arg('id') id: string,
        @Arg('update_args') updateArgs: UpdateUserArgs,
    ) {
        const res = await userRepository.updateUserById(id, updateArgs);
        return res;
    }

    @Query(() => User)
    @Authorized()
    async me(@Ctx() ctx: LoggedInContextType) {
        const res = await userRepository.getUserById(ctx.userId);
        return res;
    }
}

export default UserResolver;
