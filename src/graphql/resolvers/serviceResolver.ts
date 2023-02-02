/* eslint-disable class-methods-use-this */
import {
    CreateServiceArgs,
    PaginatedServiceResponse,
    Service,
    UpdateServiceArgs,
} from '@graphql/schemas/service';
import {
    Arg,
    Args,
    Authorized,
    Ctx,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql';
import serviceRepository from '@repositories/serviceRepository';
import { LoggedInContextType } from '@graphql/types';

@Resolver()
class ServiceResolver {
    @Authorized(['PUBLISHER'])
    @Mutation(() => Service)
    async createService(
        @Arg('creationArgs') creationArgs: CreateServiceArgs,
        @Ctx() ctx: LoggedInContextType,
    ): Promise<Service> {
        try {
            const res = await serviceRepository.addService(
                creationArgs,
                ctx.userId,
            );
            return res;
        } catch (err: any) {
            if (err.code === '23505') {
                throw new Error('DNI already in use');
            }
            throw err;
        }
    }

    @Query(() => PaginatedServiceResponse)
    @Authorized()
    async services(
        @Arg('pagination_token', { nullable: true }) paginationToken?: string,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
        @Arg('page_size', { nullable: true }) pageSize?: number,
    ) {
        const res = await serviceRepository.getServices(
            paginationToken,
            queryTerm,
            pageSize,
        );
        return res;
    }

    @Query(() => PaginatedServiceResponse)
    @Authorized()
    async myServices(
        @Ctx() ctx: LoggedInContextType,
        @Arg('pagination_token', { nullable: true }) paginationToken?: string,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
        @Arg('page_size', { nullable: true }) pageSize?: number,
    ) {
        const res = await serviceRepository.getServicesByPublisherId(
            ctx.userId,
            paginationToken,
            pageSize,
        );
        return res;
    }

    @Mutation(() => Service)
    @Authorized()
    async updateService(
        @Arg('service_id') serviceId: string,
        @Arg('updateArgs') updateArgs: UpdateServiceArgs,
        @Ctx() ctx: LoggedInContextType,
    ) {
        const service = await serviceRepository.getServiceById(serviceId);
        if (service.publisher_id !== ctx.userId) {
            throw new Error('You are not the publisher of this service');
        }
        const res = await serviceRepository.updateServiceById(
            serviceId,
            updateArgs,
        );
        return res;
    }
}

export default ServiceResolver;
