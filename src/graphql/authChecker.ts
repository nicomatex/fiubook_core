import { AuthChecker } from 'type-graphql';
import {
    ContextType, LoggedInContextType, RoleChecker, RoleTypes,
} from '@graphql/types';
import LoggedInAuthChecker from '@graphql/authCheckers/loggedInAuthChecker';
import PublisherAuthChecker from '@graphql/authCheckers/publisherAuthChecker';
import logger from '@util/logger';
import AdminAuthChecker from '@graphql/authCheckers/adminAuthChecker';

const roleCheckers = {
    PUBLISHER: PublisherAuthChecker,
    ADMIN: AdminAuthChecker,
    // TODO: Implementar todos los demas
    PROFESSOR: LoggedInAuthChecker,
    STUDENT: LoggedInAuthChecker,
    NODO: LoggedInAuthChecker,
};

const getAuthCheckerForRole = (role: RoleTypes): RoleChecker => {
    if (roleCheckers[role] === undefined) {
        throw new Error(`Invalid role ${role}`);
    }
    return roleCheckers[role];
};

export const authChecker: AuthChecker<ContextType, RoleTypes> = (
    {
        root, args, context, info,
    },
    roles,
) => {
    // Always check if user is logged in
    if (
        !LoggedInAuthChecker({
            root,
            args,
            context,
            info,
        })
    ) { return false; }

    const loggedInContext = context as LoggedInContextType;
    // Check any other necessary roles
    // eslint-disable-next-line consistent-return

    return roles.every((role) => {
        const roleChecker = getAuthCheckerForRole(role);
        logger.debug(`Checking permissions for role ${role}`);
        if (
            !roleChecker({
                root,
                args,
                context: loggedInContext,
                info,
            })
        ) {
            return false;
        }
        return true;
    });
};

export default authChecker;
