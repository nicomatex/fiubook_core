/* eslint-disable class-methods-use-this */
import {
    CreateServiceArgs, GetServicesArgs, PaginatedServiceResponse, Service,
} from '@graphql/schemas/service';
import {
    Arg,
    Authorized,
    Ctx,
    Mutation, Resolver,
} from 'type-graphql';
import { LoggedInContextType } from '@graphql/types';
import { Booking, CreateBookingArgs } from '@graphql/schemas/booking';

@Resolver()
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => Booking)
    async createBooking(@Arg('creationArgs') creationArgs: CreateBookingArgs, @Ctx() ctx: LoggedInContextType)
    : Promise<{id:String}> {
        return { id: ' 123' };
    }
}

export default BookingResolver;
