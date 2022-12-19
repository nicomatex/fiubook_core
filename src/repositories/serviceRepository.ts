import config from '@config/default';
import { CreateServiceArgs, PaginatedServiceResponse, Service } from '@graphql/schemas/service';
import {
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken, withQueryTerm,
} from '@util/dbUtil';
import logger from '@util/logger';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'postgres-array';

const connection = knex({ ...config.knex });

const addService = async (creationArgs: CreateServiceArgs, publisherId: string):
Promise<Service> => {
    const id = uuidv4();

    const newService = {
        ...creationArgs,
        id,
        publisher_id: publisherId,
        granularity: { seconds: creationArgs.granularity },
    };

    logger.debug(`Adding service ${creationArgs.name}`);
    const insertionResult = await connection('services').insert(newService).returning('*');
    const insertedService = insertionResult[0];
    logger.debug(`Service ${creationArgs.name} added successfully`);
    return insertedService;
};

const getServices = async (
    paginationToken?: string,
    queryTerm?: string,
): Promise<PaginatedServiceResponse> => {
    const query = connection('services')
        .orderBy('ts')
        .orderBy('id')
        .modify(withPaginationToken, paginationToken)
        .modify(withQueryTerm, 'search_index', queryTerm)
        .limit(config.pagination.pageSize);

    const data = await query;

    return genPaginatedResponse(data, config.pagination.pageSize, PaginatedQueryType.Services);
};

const getServicesByPublisherId = async (userId: string, paginationToken?: string) => {
    const query = connection('services')
        .where({ publisher_id: userId })
        .orderBy('ts')
        .orderBy('id')
        .modify(withPaginationToken, paginationToken)
        .limit(config.pagination.pageSize);

    const data = await query;

    return genPaginatedResponse(data, config.pagination.pageSize, PaginatedQueryType.Services);
};

const getServiceById = async (serviceId: string) => {
    const query = connection('services')
        .where({ id: serviceId });

    const data = await query;
    if (data.length === 0) throw new Error(`Service with id ${serviceId} not found`);
    const service = data[0];

    service.allowed_roles = parse(service.allowed_roles);

    return service;
};

export default {
    addService, getServices, getServicesByPublisherId, getServiceById,
};
