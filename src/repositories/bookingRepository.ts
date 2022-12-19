import config from '@config/default';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookingArgs } from '@graphql/schemas/booking';
import knex from 'knex';
import { Service } from '@graphql/schemas/service';
import { request } from 'express';

const connection = knex({ ...config.knex });

const getConflictingBookings = async (
    serviceId: string,
    startDate: Date,
    endDate: Date,
) => {
    const query = connection('bookings')
        .where({ service_id: serviceId })
        .whereBetween('start_date', [startDate, endDate])
        .orWhereBetween('end_date', [startDate, endDate])
        .orWhere((connection) => {
            connection.where('start_date', '<', startDate).andWhere('end_date', '>', endDate);
        });
    const res = await query;
    return res;
};

const getBookingsByRequestorId = async (
    requestorId: string,
) => {
    const query = connection('bookings')
        .where({ requestor_id: requestorId });

    const res = await query;
    return res;
};

const createBooking = async (
    creationArgs: CreateBookingArgs,
    requestedService: Service,
    requestorId: string,
) => {
    const newBooking = {
        ...creationArgs,
        id: uuidv4(),
        is_confirmed: requestedService.booking_type === 'AUTOMATIC',
        requestor_id: requestorId,
        publisher_id: requestedService.publisher_id,
        service_id: requestedService.id,
    };

    const insertionResult = await connection('bookings')
        .insert(newBooking).returning('*');
    const insertedBooking = insertionResult[0];
    return insertedBooking;
};

export default { getConflictingBookings, getBookingsByRequestorId, createBooking };
