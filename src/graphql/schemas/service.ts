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
class Service {
    @Field()
        ts!: Date;

    @Field(() => ID)
        id!: string;

    @Field(() => ID)
        publisher_id!: string;

    @Field(() => String)
        name!: string;

    @Field(() => String)
        description!: string;

    @Field(() => String, { description: 'Time slot granularity in ISO String format' })
        granularity!: string;

    @Field(() => Int, { description: 'Minimum amount of time slots to reserve' })
        min_time!: number;

    @Field(() => Int, { description: 'Maximum amount of time slots to reserve', nullable: true })
        max_time?: number;

    @Field(() => BookingType)
        booking_type!: BookingType;

    @Field(() => [UniversityRole])
        allowed_roles!: UniversityRole[];
}

@ObjectType()
class PaginatedServiceResponse extends PaginatedResponse(Service) {}

export { Service, PaginatedServiceResponse, GetServicesArgs };
