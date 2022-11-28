import {
    Field, ID, Int, ObjectType,
} from 'type-graphql';

import { BookingType, UniversityRole } from '@graphql/types';

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
        minTime!: number;

    @Field(() => Int, { description: 'Maximum amount of time slots to reserve', nullable: true })
        maxTime?: number;

    @Field(() => BookingType)
        bookingType!: BookingType;

    @Field(() => [UniversityRole])
        allowedRoles!: UniversityRole[];
}

export default Service;
