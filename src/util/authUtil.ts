import jwt from 'jsonwebtoken';
import config from '@config/default';
import { User } from '@graphql/schemas/user';

const createSessionToken = (user: User): string => {
    const tokenPayload = {
        userId: user.id,
        roles: user.roles,
        canPublishServices: user.can_publish_services,
    };

    const token = jwt.sign(tokenPayload, config.session.secret, {
        expiresIn: config.session.sessionDuration,
    });

    return token;
};

const decodeSessionToken = (
    token: string,
): { userId: string; roles: string[], canPublishServices: boolean} => {
    let payload;
    try {
        payload = jwt.verify(token, config.session.secret) as {
            userId: string
            roles: string[]
            canPublishServices: boolean
        };
    } catch (e) {
        throw new Error('Invalid authorization token');
    }

    return {
        userId: payload.userId,
        roles: payload.roles,
        canPublishServices: payload.canPublishServices,
    };
};

// TODO: unmock this implementation
const checkFIUBACredentials = async (
    dni: string,
    password: string,
): Promise<boolean> => true;

export { createSessionToken, checkFIUBACredentials, decodeSessionToken };
