import { ContextType } from '@graphql/types';
import { ResolverData } from 'type-graphql';

const LoggedInAuthChecker = ({
    context,
}: ResolverData<ContextType>): boolean => context.isLoggedIn;

export default LoggedInAuthChecker;
