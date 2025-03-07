/* eslint-disable class-methods-use-this */
import {
    Arg, Mutation, Resolver, UseMiddleware,
} from 'type-graphql';

import Session from '@graphql/schemas/session';
import CheckFiubaCredentialsGuard from '@graphql/middlewares/checkFIUBACredentialsMiddleware';
import { Credentials } from '@graphql/types';
import userRepository from '@repositories/userRepository';
import { createSessionToken } from '@util/authUtil';

@Resolver()
class SessionResolver {
    @Mutation(() => Session)
    @UseMiddleware(CheckFiubaCredentialsGuard)
    async createSession(
        @Arg('credentials') credentials: Credentials,
    ): Promise<Session> {
        let user = await userRepository.getUserByDNI(credentials.dni);

        // First time login case
        if (user === null) {
            user = await userRepository.addUser(credentials.dni);
        }

        const token = createSessionToken(user);
        return {
            token,
        };
    }
}

export default SessionResolver;
