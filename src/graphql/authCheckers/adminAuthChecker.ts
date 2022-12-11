import { LoggedInContextType } from '@graphql/types';
import { ResolverData } from 'type-graphql';

const AdminAuthChecker = ({
    context,
}: ResolverData<LoggedInContextType>): boolean => context.isAdmin;

export default AdminAuthChecker;
