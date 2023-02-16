import { AuthChecker } from 'type-graphql';
import {
    ContextType,
    LoggedInContextType,
    RoleChecker,
    RoleTypes,
} from '@graphql/types';
import LoggedInAuthChecker from '@graphql/authCheckers/loggedInAuthChecker';
import PublisherAuthChecker from '@graphql/authCheckers/publisherAuthChecker';
import logger from '@util/logger';
import AdminAuthChecker from '@graphql/authCheckers/adminAuthChecker';
import BookingRolesAuthChecker from '@graphql/authCheckers/bookingRolesAuthChecker';
import { createError } from 'src/errors/errorParser';

const roleCheckers = {
    PUBLISHER: PublisherAuthChecker,
    ADMIN: AdminAuthChecker,
    BOOKING_ROLES: BookingRolesAuthChecker,
};

const getAuthCheckerForRole = (role: RoleTypes): RoleChecker => {
    if (roleCheckers[role] === undefined) {
        throw createError(400, `Invalid role ${role}`);
    }
    return roleCheckers[role];
};

export const authChecker: AuthChecker<ContextType, RoleTypes> = async (
    { root, args, context, info },
    roles
) => {
    // Always check if user is logged in
    if (
        !(await LoggedInAuthChecker({
            root,
            args,
            context,
            info,
        }))
    ) {
        throw createError(401, 'Unauthenticated');
    }

    logger.debug('User deemed as logged in.');
    const loggedInContext = context as LoggedInContextType;

    // Check any other necessary roles
    // eslint-disable-next-line no-restricted-syntax
    for (const role of roles) {
        const roleChecker = getAuthCheckerForRole(role);
        // eslint-disable-next-line no-await-in-loop
        const checkResult = await roleChecker({
            root,
            args,
            context: loggedInContext,
            info,
        });
        if (!checkResult) throw createError(403, 'Unauthorized');
    }

    return true;
};

export default authChecker;
