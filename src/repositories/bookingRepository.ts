import config from '@config/default';
import { v4 as uuidv4 } from 'uuid';
import { BookingEdgesType, CreateBookingArgs } from '@graphql/schemas/booking';
import knex from 'knex';
import { Service } from '@graphql/schemas/service';
import {
    forServiceIds,
    genEdge,
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
} from '@util/dbUtil';
import adaptBooking from '@repositories/dataAdapters/bookingDataAdapter';
import { BookingStatus } from '@graphql/types';
import { createError } from '@errors/errorParser';

const connection = knex({ ...config.knex });

const getConflictingBookings = async (
    serviceId: string,
    startDate: Date,
    endDate: Date,
) => {
    const query = connection('bookings')
        .where({ service_id: serviceId })
        .whereNot({ booking_status: BookingStatus.CANCELLED })
        .andWhere((connection) => {
            connection
                .whereBetween('start_date', [startDate, endDate])
                .orWhereBetween('end_date', [startDate, endDate])
                .orWhere((connection) => {
                    connection
                        .where('start_date', '<', startDate)
                        .andWhere('end_date', '>', endDate);
                });
        });
    const res = await query;
    return res;
};

const getBookingsByRequestorId = async (
    requestorId: string,
    relevantServiceIds: string[] | null,
    paginationToken?: string,
    pageSize?: number,
) => {
    const query = connection('bookings')
        .where({ requestor_id: requestorId })
        .orderBy('ts', 'desc')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
            true,
        )
        .modify(forServiceIds, relevantServiceIds)
        .limit(pageSize ?? config.pagination.pageSize);

    const countQuery = connection('bookings')
        .where({ requestor_id: requestorId })
        .modify(forServiceIds, relevantServiceIds)
        .count();

    const totalCount = parseInt((await countQuery)[0].count as string, 10);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Bookings,
        totalCount,
    );
};

const getBookings = async (paginationToken?: string, pageSize?: number) => {
    const query = connection('bookings')
        .orderBy('ts', 'desc')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
            true,
        )
        .limit(pageSize ?? config.pagination.pageSize);

    const countQuery = connection('bookings').count();

    const totalCount = parseInt((await countQuery)[0].count as string, 10);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Bookings,
        totalCount,
    );
};

const getBookingsByPublisherId = async (
    publisherId: string,
    relevantServiceIds: string[] | null,
    paginationToken?: string,
    pageSize?: number,
) => {
    const query = connection('bookings')
        .where({ publisher_id: publisherId })
        .orderBy('ts', 'desc')
        .orderBy('id', 'desc')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
            true,
        )
        .modify(forServiceIds, relevantServiceIds)
        .limit(pageSize ?? config.pagination.pageSize);

    const countQuery = connection('bookings')
        .where({ publisher_id: publisherId })
        .modify(forServiceIds, relevantServiceIds)
        .count();

    const totalCount = parseInt((await countQuery)[0].count as string, 10);
    const data = await query;
    const parsedData = data.map(adaptBooking);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Bookings,
        totalCount,
    );
};

const createBooking = async (
    creationArgs: CreateBookingArgs,
    requestedService: Service,
    requestorId: string,
) => {
    const bookingStatus = requestedService.booking_type === 'AUTOMATIC'
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING_CONFIRMATION;

    const newBooking = {
        ...creationArgs,
        id: uuidv4(),
        booking_status: bookingStatus,
        requestor_id: requestorId,
        publisher_id: requestedService.publisher_id,
        service_id: requestedService.id,
    };

    const insertionResult = await connection('bookings')
        .insert(newBooking)
        .returning('*');
    const insertedBooking = insertionResult[0];
    const bookingEdge: BookingEdgesType = genEdge(
        insertedBooking,
        PaginatedQueryType.Bookings,
    );
    return bookingEdge;
};

const getBookingById = async (id: string) => {
    const query = connection('bookings').where({ id });

    const data = await query;
    if (data.length === 0) throw createError(404, `Booking with id ${id} not found`);
    const booking = data[0];

    const parsedBooking = adaptBooking(booking);

    return parsedBooking;
};

const deleteBookingById = async (id: string) => {
    const query = connection('bookings').where({ id }).del();
    const res = await query;
    return res >= 1;
};

const updateBookingStatusById = async (
    id: string,
    newStatus: BookingStatus,
) => {
    const query = connection('bookings')
        .where({ id })
        .update({ booking_status: newStatus })
        .returning('*');
    const data = await query;
    if (data.length === 0) throw createError(404, `Booking with id ${id} not found`);

    const modifiedBooking = data[0];

    const parsedBooking = adaptBooking(modifiedBooking);
    return parsedBooking;
};

const getBookingsMetrics = async () => {
    const bookingCount = parseInt(
        (await connection('bookings').count())[0].count as string,
        10,
    );

    const pendingBookingsCount = parseInt(
        (
            await connection('bookings')
                .where({ booking_status: BookingStatus.PENDING_CONFIRMATION })
                .count()
        )[0].count as string,
        10,
    );

    const confirmedBookingsCount = parseInt(
        (
            await connection('bookings')
                .where({ booking_status: BookingStatus.CONFIRMED })
                .count()
        )[0].count as string,
        10,
    );

    const cancelledBookingsCount = parseInt(
        (
            await connection('bookings')
                .where({ booking_status: BookingStatus.CANCELLED })
                .count()
        )[0].count as string,
        10,
    );

    return {
        booking_count: bookingCount,
        pending_bookings_count: pendingBookingsCount,
        confirmed_bookings_count: confirmedBookingsCount,
        cancelled_bookings_count: cancelledBookingsCount,
    };
};

export default {
    getConflictingBookings,
    getBookingsByRequestorId,
    getBookingsByPublisherId,
    createBooking,
    getBookingById,
    deleteBookingById,
    updateBookingStatusById,
    getBookings,
    getBookingsMetrics,
};
