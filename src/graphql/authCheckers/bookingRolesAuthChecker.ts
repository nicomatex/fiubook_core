import { CreateBookingArgs } from '@graphql/schemas/booking';
import { Service } from '@graphql/schemas/service';
import { LoggedInContextType } from '@graphql/types';
import serviceRepository from '@repositories/serviceRepository';
import logger from '@util/logger';
import { ResolverData } from 'type-graphql';

const BookingRolesAuthChecker = async ({
    context,
    args,
}: ResolverData<LoggedInContextType>): Promise<boolean> => {
    const typedArgs = args as { creationArgs: CreateBookingArgs };

    const service = (await serviceRepository.getServiceById(
        typedArgs.creationArgs.service_id,
    )) as Service;

    logger.debug(JSON.stringify(service.allowed_roles));
    logger.debug(JSON.stringify(context.roles));

    return (
        // eslint-disable-next-line max-len
        context.roles.some((userRole) => service.allowed_roles.includes(userRole)) || context.isAdmin
    );
};

export default BookingRolesAuthChecker;
