import config from '@config/default';
import { v4 as uuidv4 } from 'uuid';
import { BookingEdgesType, CreateBookingArgs } from '@graphql/schemas/booking';
import knex from 'knex';
import { Service } from '@graphql/schemas/service';
import {
    genEdge,
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
} from '@util/dbUtil';
import adaptBooking from '@repositories/dataAdapters/bookingDataAdapter';
import { BookingStatus } from '@graphql/types';

const connection = knex({ ...config.knex });

const getConflictingBookings = async (
    serviceId: string,
    startDate: Date,
    endDate: Date
) => {
    const query = connection('bookings')
        .where({ service_id: serviceId })
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
    paginationToken?: string,
    pageSize?: number
) => {
    const query = connection('bookings')
        .where({ requestor_id: requestorId })
        .orderBy('ts', 'desc')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
            true
        )
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Bookings
    );
};

const getBookingsByPublisherId = async (
    publisherId: string,
    paginationToken?: string,
    pageSize?: number
) => {
    const query = connection('bookings')
        .where({ publisher_id: publisherId })
        .orderBy('ts', 'desc')
        .orderBy('id', 'desc')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
            true
        )
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Bookings
    );
};

const createBooking = async (
    creationArgs: CreateBookingArgs,
    requestedService: Service,
    requestorId: string
) => {
    const bookingStatus =
        requestedService.booking_type === 'AUTOMATIC'
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
        PaginatedQueryType.Bookings
    );
    return bookingEdge;
};

const getBookingById = async (id: string) => {
    const query = connection('bookings').where({ id });

    const data = await query;
    if (data.length === 0) throw new Error(`Booking with id ${id} not found`);
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
    newStatus: BookingStatus
) => {
    const query = connection('bookings')
        .where({ id })
        .update({ booking_status: newStatus })
        .returning('*');
    const data = await query;
    if (data.length === 0) throw new Error(`Booking with id ${id} not found`);

    const modifiedBooking = data[0];

    const parsedBooking = adaptBooking(modifiedBooking);
    return parsedBooking;
};

export default {
    getConflictingBookings,
    getBookingsByRequestorId,
    getBookingsByPublisherId,
    createBooking,
    getBookingById,
    deleteBookingById,
    updateBookingStatusById,
};
