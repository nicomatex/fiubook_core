/* eslint-disable class-methods-use-this */
import {
    Arg,
    Authorized,
    Ctx,
    Mutation, Query, Resolver,
} from 'type-graphql';
import { LoggedInContextType } from '@graphql/types';
import { Booking, CreateBookingArgs, PaginatedBookingResponse } from '@graphql/schemas/booking';
import serviceRepository from '@repositories/serviceRepository';
import bookingRepository from '@repositories/bookingRepository';
import { Service } from '@graphql/schemas/service';

@Resolver()
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => Booking)
    async createBooking(@Arg('creationArgs') creationArgs: CreateBookingArgs, @Ctx() ctx: LoggedInContextType)
    : Promise<Booking> {
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
    async conflictingBookings(
        @Arg('service_id') serviceId: string,
        @Arg('start_date') startDate: Date,
        @Arg('end_date') endDate: Date,
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

    @Query(() => PaginatedBookingResponse)
    @Authorized()
    async myBookings(
        @Ctx() ctx: LoggedInContextType,
        @Arg('pagination_token', { nullable: true }) paginationToken?: string,
    ) {
        const res = await bookingRepository.getBookingsByRequestorId(ctx.userId, paginationToken);
        return res;
    }

    @Mutation(() => Boolean)
    @Authorized()
    async cancelBooking(
        @Arg('booking_id') bookingId: string,
        @Ctx() ctx: LoggedInContextType,
    ): Promise<Boolean> {
        const booking = await bookingRepository.getBookingById(bookingId);

        // Both the publisher and the requestor may cancel
        if (booking.requestor_id !== ctx.userId && booking.publisher_id !== ctx.userId) {
            throw new Error('You are not authorized for this action.');
        }

        const res = await bookingRepository.deleteBookingById(bookingId);
        return res;
    }
}

export default BookingResolver;
