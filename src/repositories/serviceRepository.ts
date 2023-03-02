import config from '@config/default';
import {
    CreateServiceArgs,
    PaginatedServiceResponse,
    Service,
    UpdateServiceArgs,
} from '@graphql/schemas/service';
import {
    forRoles,
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
    withQueryTerm,
} from '@util/dbUtil';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import adaptService from '@repositories/dataAdapters/serviceDataAdapter';
import { createError } from '@errors/errorParser';
import { BookingType, UniversityRole } from '@graphql/types';

const connection = knex({ ...config.knex });

const DEFAULT_IMAGE_URL =
    'https://via.placeholder.com/150/FFFFFF?text=Servicio';

const addService = async (
    creationArgs: CreateServiceArgs,
    publisherId: string
): Promise<Service> => {
    const id = uuidv4();

    const newService = {
        ...creationArgs,
        image_url: creationArgs.image_url ?? DEFAULT_IMAGE_URL,
        id,
        publisher_id: publisherId,
    };

    const insertionResult = await connection('services')
        .insert(newService)
        .returning('*');
    const insertedService = insertionResult[0];

    const parsedInsertedService = adaptService(insertedService);
    return parsedInsertedService;
};

const getServices = async (
    isAdmin: boolean,
    paginationToken?: string,
    queryTerm?: string,
    pageSize?: number,
    roles?: UniversityRole[]
): Promise<PaginatedServiceResponse> => {
    const query = connection('services')
        .orderBy('ts')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Services,
            paginationToken
        )
        .modify(withQueryTerm, 'search_index', queryTerm)
        .modify(forRoles, isAdmin, roles)
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptService);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Services
    );
};

const getServicesByPublisherId = async (
    userId: string,
    paginationToken?: string,
    queryTerm?: string,
    pageSize?: number,
) => {
    const query = connection('services')
        .where({ publisher_id: userId })
        .orderBy('ts')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Services,
            paginationToken
        )
        .modify(withQueryTerm, 'search_index', queryTerm)
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptService);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Services
    );
};

const getServiceById = async (serviceId: string) => {
    const query = connection('services').where({ id: serviceId });

    const data = await query;
    if (data.length === 0)
        throw createError(404, `Service with id ${serviceId} not found`);
    const service = data[0];

    const parsedService = adaptService(service);

    return parsedService;
};

const updateServiceById = async (
    serviceId: string,
    updateArgs: UpdateServiceArgs
) => {
    const query = connection('services')
        .where({ id: serviceId })
        .update(updateArgs)
        .returning('*');

    const data = await query;
    if (data.length === 0)
        throw createError(404, `Service with id ${serviceId} not found`);
    const service = data[0];

    const parsedService = adaptService(service);

    return parsedService;
};

const deleteServiceById = async (serviceId: string) => {
    const query = connection('services')
        .where({ id: serviceId })
        .delete()
        .returning('*');

    const data = await query;
    if (data.length === 0)
        throw createError(404, `Service with id ${serviceId} not found`);
    const service = data[0];

    const parsedService = adaptService(service);

    return parsedService;
};

const getServicesMetrics = async () => {
    const serviceCount = parseInt(
        (await connection('services').count())[0].count as string,
        10
    );

    const automaticConfirmationServicesCount = parseInt(
        (
            await connection('services')
                .where({ booking_type: BookingType.AUTOMATIC })
                .count()
        )[0].count as string,
        10
    );

    const manualConfirmationServicesCount = parseInt(
        (
            await connection('services')
                .where({ booking_type: BookingType.REQUIRES_CONFIRMATION })
                .count()
        )[0].count as string,
        10
    );

    return {
        service_count: serviceCount,
        automatic_confirmation_services_count:
            automaticConfirmationServicesCount,
        manual_confirmation_services_count: manualConfirmationServicesCount,
    };
};

export default {
    addService,
    deleteServiceById,
    getServices,
    getServicesByPublisherId,
    getServiceById,
    updateServiceById,
    getServicesMetrics,
};
