import config from '@config/default';
import logger from '@util/logger';
import knex from 'knex';

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

export { getConflictingBookings, getBookingsByRequestorId };
