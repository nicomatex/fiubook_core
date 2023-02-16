/* eslint-disable class-methods-use-this */
import { FieldResolver, Query, Resolver } from 'type-graphql';

import userRepository from '@repositories/userRepository';
import { Metrics, UsersMetrics } from '@graphql/schemas/metrics';

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
}

export default MetricsResolver;
