/* eslint-disable class-methods-use-this */
import {
    Arg, Authorized, Ctx, Mutation, Query, Resolver,
} from 'type-graphql';
import { BookingStatus, LoggedInContextType } from '@graphql/types';
import {
    Booking,
    CreateBookingArgs,
    PaginatedBookingResponse,
} from '@graphql/schemas/booking';
import serviceRepository from '@repositories/serviceRepository';
import bookingRepository from '@repositories/bookingRepository';
import { Service } from '@graphql/schemas/service';

@Resolver()
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => Booking)
    async createBooking(
        @Arg('creationArgs') creationArgs: CreateBookingArgs,
        @Ctx() ctx: LoggedInContextType,
    ): Promise<Booking> {
        if (creationArgs.start_date.getTime() < Date.now()) {
            throw new Error('Start date cannot be in the past.');
        }
        if (creationArgs.end_date <= creationArgs.start_date) {
            throw new Error(
                'End date cannot be equal or earlier than start date',
            );
        }
        const conflictingBookings = await bookingRepository.getConflictingBookings(
            creationArgs.service_id,
            creationArgs.start_date,
            creationArgs.end_date,
        );

        if (conflictingBookings.length > 0) {
            throw new Error(
                'There are conflicts with other bookings in the selected time interval',
            );
        }

        const requestedService = await serviceRepository.getServiceById(
            creationArgs.service_id,
        );

        const insertedBooking = await bookingRepository.createBooking(
            creationArgs,
            requestedService,
            ctx.userId,
        );

        const booking = { ...insertedBooking, service: requestedService };

        return booking;
    }

    @Authorized()
    async conflictingBookings(
        @Arg('service_id') serviceId: string,
        @Arg('start_date') startDate: Date,
        @Arg('end_date') endDate: Date,
    ): Promise<Service[]> {
        if (endDate <= startDate) {
            throw new Error(
                'End date cannot be equal or earlier than start date',
            );
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
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
    ) {
        const res = await bookingRepository.getBookingsByRequestorId(
            ctx.userId,
            paginationToken,
            pageSize,
        );
        return res;
    }

    @Mutation(() => Booking)
    @Authorized()
    async cancelBooking(
        @Arg('booking_id') bookingId: string,
        @Ctx() ctx: LoggedInContextType,
    ) {
        const booking = await bookingRepository.getBookingById(bookingId);

        // Both the publisher and the requestor may cancel
        if (
            booking.requestor_id !== ctx.userId
            && booking.publisher_id !== ctx.userId
        ) {
            throw new Error('You are not authorized for this action.');
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            BookingStatus.CANCELLED,
        );
        return res;
    }

    @Query(() => PaginatedBookingResponse)
    @Authorized()
    async myBookingsForPublisher(
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
    ) {
        const res = await bookingRepository.getBookingsByPublisherId(
            ctx.userId,
            paginationToken,
            pageSize,
        );
        return res;
    }

    @Mutation(() => Booking)
    @Authorized()
    async acceptBooking(
        @Arg('booking_id') bookingId: string,
        @Arg('accept') accept: boolean,
        @Ctx() ctx: LoggedInContextType,
    ) {
        const booking = await bookingRepository.getBookingById(bookingId);
        if (booking.publisher_id !== ctx.userId) {
            throw new Error('You are not authorized for this action.');
        }

        if (booking.booking_status !== BookingStatus.PENDING_CONFIRMATION) {
            throw new Error(
                `Booking with id ${bookingId} is not in pending confirmation state.`,
            );
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            accept ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED,
        );

        return res;
    }
}

export default BookingResolver;
