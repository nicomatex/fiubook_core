import {
    ArgsType, Field, ID, InputType, Int, ObjectType,
} from 'type-graphql';

import {
    BookingType,
    EdgesType,
    PageInfo,
    UniversityRole,
} from '@graphql/types';

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

@InputType()
export class UpdateServiceArgs {
    @Field(() => String, { nullable: true })
        name?: string;

    @Field(() => String, { nullable: true })
        description?: string;

    @Field(() => Int, { nullable: true })
        granularity?: number;

    @Field(() => Int, { nullable: true })
        min_time?: number;

    @Field(() => Int, { nullable: true })
        max_time?: number;

    @Field(() => BookingType, { nullable: true })
        booking_type?: BookingType;

    @Field(() => [UniversityRole], { nullable: true })
        allowed_roles?: UniversityRole[];
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

    @Field(() => Int, { description: 'Time slot granularity in seconds' })
        granularity!: number;

    @Field(() => Int, {
        description: 'Minimum amount of time slots to reserve',
    })
        min_time!: number;

    @Field(() => Int, {
        description: 'Maximum amount of time slots to reserve',
        nullable: true,
    })
        max_time?: number;

    @Field(() => BookingType)
        booking_type!: BookingType;

    @Field(() => [UniversityRole])
        allowed_roles!: UniversityRole[];
}

@ObjectType()
class ServicesEdgesType extends EdgesType(Service) {}

@ObjectType()
class PaginatedServiceResponse {
    @Field(() => [ServicesEdgesType])
        edges!: ServicesEdgesType[];

    @Field(() => PageInfo)
        pageInfo!: PageInfo;
}

export { Service, PaginatedServiceResponse };
