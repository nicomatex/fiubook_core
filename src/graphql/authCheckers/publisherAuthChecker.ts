import { ContextType, LoggedInContextType } from '@graphql/types';
import logger from '@util/logger';
import { ResolverData } from 'type-graphql';

const PublisherAuthChecker = ({
    context,
}: ResolverData<LoggedInContextType>): Promise<boolean> => {
    logger.debug(`User can publish: ${context.canPublishServices}`);
    return Promise.resolve(context.canPublishServices);
};

export default PublisherAuthChecker;
