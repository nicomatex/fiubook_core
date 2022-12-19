import { CreateBookingArgs } from '@graphql/schemas/booking';
import { Service } from '@graphql/schemas/service';
import { LoggedInContextType } from '@graphql/types';
import serviceRepository from '@repositories/serviceRepository';
import logger from '@util/logger';
import { ResolverData } from 'type-graphql';

const BookingRolesAuthChecker = async ({
    context, args,
}: ResolverData<LoggedInContextType>): Promise<boolean> => {
    const typedArgs = args as {creationArgs: CreateBookingArgs};

    const service = await serviceRepository
        .getServiceById(typedArgs.creationArgs.service_id) as Service;

    logger.debug(JSON.stringify(service.allowed_roles));
    logger.debug(JSON.stringify(args));

    return true;
};

export default BookingRolesAuthChecker;
