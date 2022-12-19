import {
    ArgsType,
    Field, ID, InputType, Int, ObjectType,
} from 'type-graphql';

import { PaginatedResponse } from '@graphql/types';

@InputType()
export class CreateBookingArgs {
    @Field(() => ID)
        service_id!: string;

    @Field(() => ID)
        requestor_id!: string;

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
}

@ObjectType()
class PaginatedBookingResponse extends PaginatedResponse(Booking) {}

export { Booking, PaginatedBookingResponse };
