import { AuthChecker } from 'type-graphql';
import { ContextType, RoleChecker, RoleTypes } from '@graphql/types';
import LoggedInAuthChecker from '@graphql/authCheckers/loggedInAuthChecker';

const roleCheckers = {
    LOGGED_IN: LoggedInAuthChecker,
    // TODO: Implementar todos los demas
    ADMIN: LoggedInAuthChecker,
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
    const loggedInRoleChecker = getAuthCheckerForRole('LOGGED_IN');
    if (
        !loggedInRoleChecker({
            root,
            args,
            context,
            info,
        })
    ) { return false; }

    // Check any other necessary roles
    // eslint-disable-next-line consistent-return
    roles.forEach((role) => {
        const roleChecker = getAuthCheckerForRole(role);
        if (
            !roleChecker({
                root,
                args,
                context,
                info,
            })
        ) { return false; }
    });

    return true;
};

export default authChecker;
