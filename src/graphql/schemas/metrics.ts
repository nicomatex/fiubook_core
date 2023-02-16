/* eslint-disable max-classes-per-file */
import { EdgesType, PageInfo, UniversityRole } from '@graphql/types';
import {
    Field, ID, InputType, ObjectType,
} from 'type-graphql';

@ObjectType()
class UsersMetrics {
    @Field()
        user_count!: number;

    @Field()
        professor_count!: number;

    @Field()
        student_count!: number;

    @Field()
        nodo_count!: number;

    @Field()
        banned_count!: number;
}

@ObjectType()
class ServicesMetrics {
    @Field()
        service_count!: number;

    @Field()
        automatic_confirmation_services_count!: number;

    @Field()
        manual_confirmation_services_count!: number;
}

@ObjectType()
class BookingsMetrics {
    @Field()
        booking_count!: number;

    @Field()
        pending_bookings_count!: number;

    @Field()
        approved_bookings_count!: number;

    @Field()
        cancelled_bookings_count!: number;
}

@ObjectType()
class Metrics {
    @Field(() => UsersMetrics, { nullable: true })
        users?: UsersMetrics;

    @Field(() => ServicesMetrics, { nullable: true })
        services?: ServicesMetrics;

    @Field(() => BookingsMetrics, { nullable: true })
        bookings?: BookingsMetrics;
}

export {
    Metrics, UsersMetrics, ServicesMetrics, BookingsMetrics,
};
