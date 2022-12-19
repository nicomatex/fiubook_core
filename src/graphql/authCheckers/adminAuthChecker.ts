import { LoggedInContextType } from '@graphql/types';
import { ResolverData } from 'type-graphql';

const AdminAuthChecker = ({
    context,
}: ResolverData<LoggedInContextType>): Promise<boolean> => Promise.resolve(context.isAdmin);

export default AdminAuthChecker;
