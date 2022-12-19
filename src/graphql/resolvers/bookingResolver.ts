/* eslint-disable class-methods-use-this */
import {
    Arg,
    Authorized,
    Ctx,
    Mutation, Resolver,
} from 'type-graphql';
import { LoggedInContextType } from '@graphql/types';
import { Booking, CreateBookingArgs } from '@graphql/schemas/booking';
import serviceRepository from '@repositories/serviceRepository';
import bookingRepository from '@repositories/bookingRepository';

@Resolver()
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => Booking)
    async createBooking(@Arg('creationArgs') creationArgs: CreateBookingArgs, @Ctx() ctx: LoggedInContextType)
    : Promise<{id:String}> {
        if (creationArgs.end_date <= creationArgs.start_date) {
            throw new Error('End date cannot be equal or earlier than start date');
        }
        const conflictingBookings = await bookingRepository.getConflictingBookings(
            creationArgs.service_id,
            creationArgs.start_date,
            creationArgs.end_date,
        );

        if (conflictingBookings.length > 0) {
            throw new Error('There are conflicts with other bookings in the selected time interval');
        }

        const requestedService = await serviceRepository.getServiceById(creationArgs.service_id);

        const insertedBooking = await bookingRepository.createBooking(
            creationArgs,
            requestedService,
            ctx.userId,
        );

        return insertedBooking;
    }
}

export default BookingResolver;
