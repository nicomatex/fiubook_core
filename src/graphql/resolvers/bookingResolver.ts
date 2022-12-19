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
import serviceRepository from '@repositories/serviceRepository';
import { getConflictingBookings } from '@repositories/bookingRepository';

@Resolver()
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => Booking)
    async createBooking(@Arg('creationArgs') creationArgs: CreateBookingArgs, @Ctx() ctx: LoggedInContextType)
    : Promise<{id:String}> {
        if (creationArgs.end_date >= creationArgs.start_date) {
            throw new Error('End date cannot be equal or later than start date');
        }

        const requestedService = await serviceRepository.getServiceById(creationArgs.service_id);

        const bookings = getConflictingBookings(
            creationArgs.service_id,
            creationArgs.start_date,
            creationArgs.end_date,
        );
        return { id: ' 123' };
    }
}

export default BookingResolver;
