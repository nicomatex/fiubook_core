/* eslint-disable class-methods-use-this */
import { FieldResolver, Query, Resolver } from 'type-graphql';

import userRepository from '@repositories/userRepository';
import {
    Metrics,
    ServicesMetrics,
    UsersMetrics,
} from '@graphql/schemas/metrics';
import serviceRepository from '@repositories/serviceRepository';

@Resolver(() => Metrics)
class MetricsResolver {
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
}

export default MetricsResolver;
