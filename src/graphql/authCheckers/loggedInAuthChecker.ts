import { ContextType } from '@graphql/types';
import { ResolverData } from 'type-graphql';

const LoggedInAuthChecker = ({
    context,
}: ResolverData<ContextType>): Promise<boolean> => Promise.resolve(context.isLoggedIn);

export default LoggedInAuthChecker;
