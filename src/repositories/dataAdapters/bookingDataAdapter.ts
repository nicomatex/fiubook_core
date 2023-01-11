import { Booking } from '@graphql/schemas/booking';

export type RawBooking = {
    id: string,
    ts: Date,
    service_id: string,
    requestor_id: string,
    publisher_id: string,
    start_date: Date,
    end_date: Date,
    is_confirmed: boolean,
}

const adapt = (rawBooking: RawBooking): Booking => ({
    ...rawBooking,
});

export default adapt;
