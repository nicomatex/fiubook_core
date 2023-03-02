/* eslint-disable class-methods-use-this */
import {
    CreateServiceArgs,
    PaginatedServiceResponse,
    Service,
    UpdateServiceArgs,
} from '@graphql/schemas/service';
import {
    Arg,
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
import { createError } from '@errors/errorParser';
import constants from '../../constants';

const validateServiceArgs = (serviceAttributes: {
    name?: string;
    description?: string;
    tags?: string[];
    image_url?: string;
}) => {
    [
        { attr: 'name', limit: 'maxNameLength' },
        { attr: 'description', limit: 'maxDescriptionLength' },
        { attr: 'tags', limit: 'maxTags' },
        { attr: 'image_url', limit: 'maxImageUrlLength' },
    ].forEach(({ attr, limit }) => {
        const currentAttrLength = (serviceAttributes as any)[attr]?.length;
        if (!currentAttrLength) return;

        const attrMaxLength = (constants.serviceLimits as any)[limit];

        if (currentAttrLength >= attrMaxLength) {
            throw createError(
                400,
                `Service ${attr} length must be lower than ${attrMaxLength} (current ${currentAttrLength})`
            );
        }
    });

    serviceAttributes.tags?.forEach((tag) => {
        if (tag.length > constants.serviceLimits.maxTagLength) {
            throw createError(
                400,
                `Service tags lengths must be lower than ${constants.serviceLimits.maxTagLength} (current ${tag.length} on tag ${tag})`
            );
        }
    });
};

const validateServiceModificationPermissions = (
    ctx: LoggedInContextType,
    service: Service
) => {
    if (service.publisher_id !== ctx.userId && !ctx.isAdmin) {
        throw createError(403, "You don't have permissions for this action");
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
        validateServiceArgs(creationArgs);

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
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('query_term', { nullable: true }) queryTerm?: string,
        @Arg('first', { nullable: true }) pageSize?: number
    ) {
        return await serviceRepository.getServices(
            ctx.isAdmin,
            paginationToken,
            queryTerm,
            pageSize,
            ctx.roles
        );
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
            queryTerm,
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

        validateServiceModificationPermissions(ctx, service);
        validateServiceArgs(updateArgs);

        return await serviceRepository.updateServiceById(serviceId, updateArgs);
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

        validateServiceModificationPermissions(ctx, service);

        return await serviceRepository.deleteServiceById(serviceId);
    }
}

export default ServiceResolver;
