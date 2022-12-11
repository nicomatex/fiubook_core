import { ContextType } from '@graphql/types';
import type { IncomingHttpHeaders } from 'http';
import { decodeSessionToken } from '@util/authUtil';

const buildContext = (headers: IncomingHttpHeaders): ContextType => {
    const authHeader = headers.authorization;
    if (!authHeader) {
        return {
            isLoggedIn: false,
        };
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') throw new Error('Wrong token type, not Bearer');

    const sessionPayload = decodeSessionToken(token);
    return sessionPayload;
};

// eslint-disable-next-line import/prefer-default-export
export { buildContext };
