import config from '@config/default';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingArgs } from '@graphql/schemas/booking';
import knex from 'knex';
import { Service } from '@graphql/schemas/service';
import {
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
} from '@util/dbUtil';
import adaptBooking from '@repositories/dataAdapters/bookingDataAdapter';
import { BookingStatus } from '@graphql/types';
import { DatabaseBooking, DatabaseService } from '@repositories/types';

const connection = knex({ ...config.knex });

const getConflictingBookings = async (
    serviceId: string,
    startDate: Date,
    endDate: Date,
): Promise<DatabaseBooking[]> => {
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
    pageSize?: number,
): Promise<DatabaseBooking[]> => {
    const query = connection('bookings')
        .where({ requestor_id: requestorId })
        .orderBy('ts')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Bookings,
            paginationToken,
        )
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return parsedData;
};

const getBookingsByPublisherId = async (
    publisherId: string,
    paginationToken?: string,
    pageSize?: number,
): Promise<DatabaseBooking[]> => {
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
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;
    const parsedData = data.map(adaptBooking);

    return parsedData;
};

const createBooking = async (
    creationArgs: CreateBookingArgs,
    requestedService: DatabaseService,
    requestorId: string,
): Promise<DatabaseBooking> => {
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
    return insertedBooking;
};

const getBookingById = async (id: string): Promise<DatabaseBooking> => {
    const query = connection('bookings').where({ id });

    const data = await query;
    if (data.length === 0) throw new Error(`Booking with id ${id} not found`);
    const booking = data[0];

    const parsedBooking = adaptBooking(booking);

    return parsedBooking;
};

const deleteBookingById = async (id: string): Promise<boolean> => {
    const query = connection('bookings').where({ id }).del();
    const res = await query;
    return res >= 1;
};

const updateBookingStatusById = async (
    id: string,
    newStatus: BookingStatus,
): Promise<DatabaseBooking> => {
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
