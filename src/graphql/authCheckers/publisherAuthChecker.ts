import { ContextType, LoggedInContextType } from '@graphql/types';
import logger from '@util/logger';
import { ResolverData } from 'type-graphql';

const PublisherAuthChecker = ({
    context,
}: ResolverData<LoggedInContextType>): boolean => {
    logger.debug(`User can publish: ${context.canPublishServices}`);
    return context.canPublishServices;
};

export default PublisherAuthChecker;
