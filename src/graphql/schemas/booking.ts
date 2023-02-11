import { Field, ID, InputType, ObjectType } from 'type-graphql';

import { BookingStatus, EdgesType, PageInfo } from '@graphql/types';
import { Service } from '@graphql/schemas/service';
import { User } from '@graphql/schemas/user';

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

    @Field(() => Service, { nullable: true })
    service?: Service | null;

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

    @Field(() => User, { nullable: true })
    requestor?: User | null;
}

@ObjectType()
class BookingEdgesType extends EdgesType(Booking) {}

@ObjectType()
class PaginatedBookingResponse {
    @Field(() => [BookingEdgesType])
    edges!: BookingEdgesType[];

    @Field(() => PageInfo)
    pageInfo!: PageInfo;
}

@ObjectType()
class CreateBookingResponse {
    @Field(() => BookingEdgesType)
    bookingEdge!: BookingEdgesType;
}

export {
    Booking,
    BookingEdgesType,
    CreateBookingResponse,
    PaginatedBookingResponse,
};
