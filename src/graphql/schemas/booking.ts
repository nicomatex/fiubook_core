import {
    ArgsType,
    Field, ID, InputType, Int, ObjectType,
} from 'type-graphql';

import { BookingType, PaginatedResponse, UniversityRole } from '@graphql/types';

@ArgsType()
class GetServicesArgs {
    @Field({ nullable: true })
        pagination_token?: string;

    @Field(() => String, { nullable: true })
        query_term?: string;
}

@InputType()
export class CreateServiceArgs {
    @Field(() => String)
        name!: string;

    @Field(() => String)
        description!: string;

    @Field(() => Int)
        granularity!: number;

    @Field(() => Int)
        min_time!: number;

    @Field(() => Int, { nullable: true })
        max_time?: number;

    @Field(() => BookingType)
        booking_type!: BookingType;

    @Field(() => [UniversityRole])
        allowed_roles!: UniversityRole[];
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

export { Booking, PaginatedBookingResponse, GetServicesArgs };
