import Service, { CreateServiceArgs } from '@graphql/schemas/service';
import {
    Mutation, Resolver,
} from 'type-graphql';

@Resolver()
class ServiceResolver {
    @Mutation(() => Service)
    async createService(@Args() {
        name, description, granularity, min_time: minTime,
        max_time: maxTime, booking_type: bookingType, allowed_roles: allowedRoles,
    }: CreateServiceArgs): Promise<Service> {

    }
}
