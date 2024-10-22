/* eslint-disable class-methods-use-this */
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import {
    BookingStatus,
    LoggedInContextType,
    NotificationType,
} from '@graphql/types';
import {
    Booking,
    BookingEdgesType,
    CreateBookingArgs,
    CreateBookingResponse,
    PaginatedBookingResponse,
} from '@graphql/schemas/booking';
import serviceRepository from '@repositories/serviceRepository';
import bookingRepository from '@repositories/bookingRepository';
import userRepository from '@repositories/userRepository';
import { User } from '@graphql/schemas/user';
import { Service } from '@graphql/schemas/service';
import { createError } from '@errors/errorParser';
import notificationRepository from '@repositories/notificationRepository';

const validateBookingDateLimits = ({
    start_date: startDate,
    end_date: endDate,
}: CreateBookingArgs) => {
    if (startDate.getTime() < Date.now()) {
        throw createError(400, 'Start date cannot be in the past.');
    }
    if (endDate <= startDate) {
        throw createError(
            400,
            'End date cannot be equal or earlier than start date.',
        );
    }
};

const validateNoConflictingBookings = async ({
    service_id: serviceId,
    start_date: startDate,
    end_date: endDate,
}: CreateBookingArgs) => {
    const conflictingBookings = await bookingRepository.getConflictingBookings(
        serviceId,
        startDate,
        endDate,
    );

    if (conflictingBookings.length > 0) {
        throw createError(
            409,
            'There are conflicts with other bookings in the selected time interval.',
        );
    }
};

const validateBookingSlot = (
    { start_date: startDate, end_date: endDate }: CreateBookingArgs,
    { granularity, max_time: maxTime }: Service,
) => {
    const granularityMs = granularity * 1000;
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if ((endTime - startTime) % granularityMs > 0) {
        throw createError(
            400,
            `Booking slot duration must be a multiple of the granularity (${granularity} seconds).`,
        );
    }

    const bookingLengthInSlots = (endTime - startTime) / granularityMs;
    if (maxTime && bookingLengthInSlots > maxTime) {
        throw createError(
            400,
            `Booking slot length (${bookingLengthInSlots} slots of ${granularity} seconds) exceeds maximum amount of slots (${maxTime} slots).`,
        );
    }
};

@Resolver(() => Booking)
class BookingResolver {
    @Authorized(['BOOKING_ROLES'])
    @Mutation(() => CreateBookingResponse)
    async createBooking(
        @Arg('creationArgs') creationArgs: CreateBookingArgs,
        @Ctx() ctx: LoggedInContextType,
    ): Promise<CreateBookingResponse> {
        validateBookingDateLimits(creationArgs);
        await validateNoConflictingBookings(creationArgs);

        const requestedService = await serviceRepository.getServiceById(
            creationArgs.service_id,
        );

        validateBookingSlot(creationArgs, requestedService);

        const insertedBookingEdge: BookingEdgesType = await bookingRepository.createBooking(
            creationArgs,
            requestedService,
            ctx.userId,
        );

        // TODO: this shouldn't happen syncronically
        await notificationRepository.createNotification(
            requestedService.publisher_id,
            insertedBookingEdge.node.id,
            NotificationType.NEW_BOOKING_REQUEST,
        );

        if (
            insertedBookingEdge.node.booking_status === BookingStatus.CONFIRMED
        ) {
            await notificationRepository.createNotification(
                ctx.userId,
                insertedBookingEdge.node.id,
                NotificationType.BOOKING_REQUEST_ACCEPTED,
            );
        }

        return { bookingEdge: insertedBookingEdge };
    }

    @Query(() => [Booking])
    @Authorized()
    async conflictingBookings(
        @Arg('service_id') serviceId: string,
        @Arg('start_date') startDate: Date,
        @Arg('end_date') endDate: Date,
    ): Promise<Booking[]> {
        if (endDate <= startDate) {
            throw createError(
                400,
                'End date cannot be equal or earlier than start date.',
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
        @Arg('query_term', { nullable: true }) queryTerm?: string,
    ) {
        let relevantServiceIds: string[] | null = null;
        if (queryTerm) {
            // TODO: this could be more efficient
            relevantServiceIds = (
                await serviceRepository.getServices(
                    ctx.isAdmin,
                    undefined,
                    queryTerm,
                    1000,
                    ctx.roles,
                )
            ).edges.map((edge) => edge.node.id);
        }
        const res = await bookingRepository.getBookingsByRequestorId(
            ctx.userId,
            relevantServiceIds,
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
            !ctx.isAdmin
            && booking.requestor_id !== ctx.userId
            && booking.publisher_id !== ctx.userId
        ) {
            throw createError(403, 'You are not authorized for this action.');
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            BookingStatus.CANCELLED,
        );

        // TODO: this would be better if it didn't happen syncronically
        await notificationRepository.createNotification(
            booking.publisher_id,
            bookingId,
            NotificationType.BOOKING_REQUEST_CANCELLED,
        );
        await notificationRepository.createNotification(
            booking.requestor_id,
            bookingId,
            NotificationType.BOOKING_CANCELLED,
        );
        return res;
    }

    @Query(() => PaginatedBookingResponse)
    @Authorized()
    async myBookingsForPublisher(
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
    ) {
        let relevantServiceIds: string[] | null = null;
        if (queryTerm) {
            // TODO: this could be more efficient
            relevantServiceIds = (
                await serviceRepository.getServices(
                    ctx.isAdmin,
                    undefined,
                    queryTerm,
                    1000,
                    ctx.roles,
                )
            ).edges.map((edge) => edge.node.id);
        }
        const res = await bookingRepository.getBookingsByPublisherId(
            ctx.userId,
            relevantServiceIds,
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
        if (!ctx.isAdmin && booking.publisher_id !== ctx.userId) {
            throw createError(403, 'You are not authorized for this action.');
        }

        if (booking.booking_status !== BookingStatus.PENDING_CONFIRMATION) {
            throw createError(
                400,
                `Booking with id ${bookingId} is not in pending confirmation state.`,
            );
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            accept ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED,
        );

        await notificationRepository.createNotification(
            booking.requestor_id,
            bookingId,
            accept
                ? NotificationType.BOOKING_REQUEST_ACCEPTED
                : NotificationType.BOOKING_REQUEST_REJECTED,
        );

        return res;
    }

    @Mutation(() => Booking)
    @Authorized()
    async deliverBookingObject(
        @Arg('booking_id') bookingId: string,
        @Ctx() ctx: LoggedInContextType,
    ) {
        const booking = await bookingRepository.getBookingById(bookingId);
        if (!ctx.isAdmin && booking.publisher_id !== ctx.userId) {
            throw createError(403, 'You are not authorized for this action.');
        }

        if (booking.booking_status !== BookingStatus.CONFIRMED) {
            throw createError(
                400,
                `Booking with id ${bookingId} is not confirmed. You cannot flag it as delivered.`,
            );
        }

        const service = await serviceRepository.getServiceById(
            booking.service_id,
        );
        if (!service.returnable) {
            throw createError(
                400,
                `Booking with id ${bookingId} of service ${booking.service_id} cannot be flagged as delivered. The service is not returnable.`,
            );
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            BookingStatus.PENDING_RETURN,
        );
        await notificationRepository.createNotification(
            booking.requestor_id,
            bookingId,
            NotificationType.OBJECT_DELIVERED,
        );
        return res;
    }

    @Mutation(() => Booking)
    @Authorized()
    async returnBookingObject(
        @Arg('booking_id') bookingId: string,
        @Ctx() ctx: LoggedInContextType,
    ) {
        const booking = await bookingRepository.getBookingById(bookingId);
        if (!ctx.isAdmin && booking.publisher_id !== ctx.userId) {
            throw createError(403, 'You are not authorized for this action.');
        }

        if (booking.booking_status !== BookingStatus.PENDING_RETURN) {
            throw createError(
                400,
                `Booking with id ${bookingId} has not been flagged as delivered. You cannot flag it as returned.`,
            );
        }

        const res = await bookingRepository.updateBookingStatusById(
            bookingId,
            BookingStatus.RETURNED,
        );

        await notificationRepository.createNotification(
            booking.requestor_id,
            bookingId,
            NotificationType.OBJECT_RETURNED,
        );

        return res;
    }

    @FieldResolver()
    async service(@Root() booking: Booking) {
        const service = await serviceRepository.getServiceById(
            booking.service_id,
        );
        return service;
    }

    @FieldResolver(() => User)
    async requestor(@Root() booking: Booking) {
        const requestor = await userRepository.getUserById(
            booking.requestor_id,
        );
        return requestor;
    }

    @FieldResolver(() => User)
    async publisher(@Root() booking: Booking) {
        const publisher = await userRepository.getUserById(
            booking.publisher_id,
        );
        return publisher;
    }

    @Query(() => PaginatedBookingResponse)
    @Authorized(['ADMIN'])
    async bookings(
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
    ) {
        const res = await bookingRepository.getBookings(
            paginationToken,
            pageSize,
        );
        return res;
    }
}

export default BookingResolver;
