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
import { Service } from '@graphql/schemas/service';

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

    @Authorized()
    async getConflictingBookings(
        @Arg('service_id') serviceId: string,
        @Arg('start_date') startDate: Date,
        @Arg('end_date') endDate: Date,
        @Ctx() ctx: LoggedInContextType,
    ): Promise<Service[]> {
        if (endDate <= startDate) {
            throw new Error('End date cannot be equal or earlier than start date');
        }

        const conflictingBookings = await bookingRepository.getConflictingBookings(
            serviceId,
            startDate,
            endDate,
        );

        return conflictingBookings;
    }
}

export default BookingResolver;
