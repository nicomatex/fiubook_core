import { BookingStatus } from '@graphql/types';
import { DatabaseBooking } from '@repositories/types';

export type RawBooking = {
    id: string
    ts: Date
    service_id: string
    requestor_id: string
    publisher_id: string
    start_date: Date
    end_date: Date
    booking_status: BookingStatus
}

const adapt = (rawBooking: RawBooking): DatabaseBooking => ({
    ...rawBooking,
});

export default adapt;
