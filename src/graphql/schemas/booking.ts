import {
    Field, ID, InputType, ObjectType,
} from 'type-graphql';

import { BookingStatus, PaginatedResponse } from '@graphql/types';

@InputType()
export class CreateBookingArgs {
    @Field(() => ID)
        service_id!: string;

    @Field()
        start_date!: Date;

    @Field()
        end_date!: Date;
}

@ObjectType()
class Booking {
    @Field(() => ID)
        id!: string;

    @Field()
        ts!: Date;

    @Field(() => ID)
        service_id!: string;

    @Field(() => ID)
        requestor_id!: string;

    @Field(() => ID)
        publisher_id!: string;

    @Field()
        start_date!: Date;

    @Field()
        end_date!: Date;

    @Field()
        booking_status!: BookingStatus;
}

@ObjectType()
class PaginatedBookingResponse extends PaginatedResponse(Booking) {}

export { Booking, PaginatedBookingResponse };
