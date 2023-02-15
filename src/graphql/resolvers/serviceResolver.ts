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
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import serviceRepository from '@repositories/serviceRepository';
import { LoggedInContextType } from '@graphql/types';
import userRepository from '@repositories/userRepository';
import { createError } from 'src/errors/errorParser';

const validateServiceModification = (
    ctx: LoggedInContextType,
    service: Service
) => {
    if (service.publisher_id !== ctx.userId && !ctx.isAdmin) {
        throw createError(403, `You don't have permissions for this action`);
    }
};

@Resolver(() => Service)
class ServiceResolver {
    @Authorized(['PUBLISHER'])
    @Mutation(() => Service)
    async createService(
        @Arg('creationArgs') creationArgs: CreateServiceArgs,
        @Ctx() ctx: LoggedInContextType
    ): Promise<Service> {
        try {
            const res = await serviceRepository.addService(
                creationArgs,
                ctx.userId
            );
            return res;
        } catch (err: any) {
            if (err.code === '23505') {
                throw createError(409, 'DNI already in use');
            }
            throw err;
        }
    }

    @Query(() => PaginatedServiceResponse)
    @Authorized()
    async services(
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
        @Arg('first', { nullable: true }) pageSize?: number
    ) {
        const res = await serviceRepository.getServices(
            paginationToken,
            queryTerm,
            pageSize
        );
        return res;
    }

    @Query(() => PaginatedServiceResponse)
    @Authorized()
    async myServices(
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
        @Arg('first', { nullable: true }) pageSize?: number
    ) {
        const res = await serviceRepository.getServicesByPublisherId(
            ctx.userId,
            paginationToken,
            pageSize
        );
        return res;
    }

    @Mutation(() => Service)
    @Authorized()
    async updateService(
        @Arg('service_id') serviceId: string,
        @Arg('update_args') updateArgs: UpdateServiceArgs,
        @Ctx() ctx: LoggedInContextType
    ) {
        const service = await serviceRepository.getServiceById(serviceId);

        validateServiceModification(ctx, service);

        const res = await serviceRepository.updateServiceById(
            serviceId,
            updateArgs
        );
        return res;
    }

    @FieldResolver()
    async publisher(@Root() service: Service) {
        const publisher = await userRepository.getUserById(
            service.publisher_id
        );
        return publisher;
    }

    @Authorized(['PUBLISHER'])
    @Mutation(() => Service)
    async deleteService(
        @Arg('service_id') serviceId: string,
        @Ctx() ctx: LoggedInContextType
    ): Promise<Service> {
        const service = await serviceRepository.getServiceById(serviceId);

        validateServiceModification(ctx, service);

        const res = await serviceRepository.deleteServiceById(serviceId);
        return res;
    }
}

export default ServiceResolver;
