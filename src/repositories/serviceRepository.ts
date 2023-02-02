import config from '@config/default';
import {
    CreateServiceArgs,
    PaginatedServiceResponse,
    Service,
} from '@graphql/schemas/service';
import {
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
    withQueryTerm,
} from '@util/dbUtil';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import adaptService from '@repositories/dataAdapters/serviceDataAdapter';

const connection = knex({ ...config.knex });

const addService = async (
    creationArgs: CreateServiceArgs,
    publisherId: string,
): Promise<Service> => {
    const id = uuidv4();

    const newService = {
        ...creationArgs,
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
    paginationToken?: string,
    queryTerm?: string,
    pageSize?: number,
): Promise<PaginatedServiceResponse> => {
    const query = connection('services')
        .orderBy('ts')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Services,
            paginationToken,
        )
        .modify(withQueryTerm, 'search_index', queryTerm)
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptService);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Services,
    );
};

const getServicesByPublisherId = async (
    userId: string,
    paginationToken?: string,
    pageSize?: number,
) => {
    const query = connection('services')
        .where({ publisher_id: userId })
        .orderBy('ts')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Services,
            paginationToken,
        )
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptService);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Services,
    );
};

const getServiceById = async (serviceId: string) => {
    const query = connection('services').where({ id: serviceId });

    const data = await query;
    if (data.length === 0) throw new Error(`Service with id ${serviceId} not found`);
    const service = data[0];

    const parsedService = adaptService(service);

    return parsedService;
};

export default {
    addService,
    getServices,
    getServicesByPublisherId,
    getServiceById,
};
