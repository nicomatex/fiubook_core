import jwt from 'jsonwebtoken';
import config from '@config/default';
import { User } from '@graphql/schemas/user';
import { LoggedInContextType } from '@graphql/types';

const createSessionToken = (user: User): string => {
    const tokenPayload = {
        userId: user.id,
        roles: user.roles,
        canPublishServices: user.can_publish_services,
        isAdmin: user.is_admin,
    };

    const token = jwt.sign(tokenPayload, config.session.secret, {
        expiresIn: config.session.sessionDuration,
    });

    return token;
};

const decodeSessionToken = (
    token: string,
): LoggedInContextType => {
    let payload;
    try {
        payload = jwt.verify(token, config.session.secret) as {
            userId: string
            roles: string[]
            canPublishServices: boolean
            isAdmin: boolean
        };
    } catch (e) {
        throw new Error('Invalid authorization token');
    }

    return {
        userId: payload.userId,
        roles: payload.roles,
        canPublishServices: payload.canPublishServices,
        isAdmin: payload.isAdmin,
        isLoggedIn: true,
    };
};

// TODO: unmock this implementation
const checkFIUBACredentials = async (
    dni: string,
    password: string,
): Promise<boolean> => true;

export { createSessionToken, checkFIUBACredentials, decodeSessionToken };
