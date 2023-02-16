/* eslint-disable class-methods-use-this */
import {
    Authorized, FieldResolver, Query, Resolver,
} from 'type-graphql';

import userRepository from '@repositories/userRepository';
import {
    BookingsMetrics,
    Metrics,
    ServicesMetrics,
    UsersMetrics,
} from '@graphql/schemas/metrics';
import serviceRepository from '@repositories/serviceRepository';
import bookingRepository from '@repositories/bookingRepository';

@Resolver(() => Metrics)
class MetricsResolver {
    @Authorized(['ADMIN'])
    @Query(() => Metrics)
    async metrics(): Promise<Metrics> {
        const metrics = {};
        return metrics;
    }

    @FieldResolver()
    async users(): Promise<UsersMetrics> {
        const metrics = await userRepository.getUsersMetrics();
        return metrics;
    }

    @FieldResolver()
    async services(): Promise<ServicesMetrics> {
        const metrics = await serviceRepository.getServicesMetrics();
        return metrics;
    }

    @FieldResolver()
    async bookings(): Promise<BookingsMetrics> {
        const metrics = await bookingRepository.getBookingsMetrics();
        return metrics;
    }
}

export default MetricsResolver;
