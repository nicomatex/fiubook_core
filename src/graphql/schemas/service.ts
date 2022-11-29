import {
    ArgsType,
    Field, ID, Int, ObjectType,
} from 'type-graphql';

import { BookingType, UniversityRole } from '@graphql/types';

@ArgsType()
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
    @Field(() => ID)
        id!: string;

    @Field(() => ID)
        publisherID!: string;

    @Field(() => String)
        name!: string;

    @Field(() => String)
        description!: string;

    @Field(() => Int, { description: 'Time slot granularity in seconds' })
        granularity!: number;

    @Field(() => Int, { description: 'Minimum amount of time slots to reserve' })
        min_time!: number;

    @Field(() => Int, { description: 'Maximum amount of time slots to reserve', nullable: true })
        max_time?: number;

    @Field(() => BookingType)
        booking_type!: BookingType;

    @Field(() => [UniversityRole])
        allowed_roles!: UniversityRole[];
}

export default Service;
