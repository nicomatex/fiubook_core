import config from '@config/default';
import { CreateServiceArgs, PaginatedServiceResponse, Service } from '@graphql/schemas/service';
import {
    decodePaginationToken, genPaginationToken, PaginatedQueryType,
    withPaginationToken, withQueryTerm,
} from '@util/dbUtil';
import logger from '@util/logger';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import pgTsquery from 'pg-tsquery';

const queryEscaper = pgTsquery();

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
        .modify(withQueryTerm, queryTerm)
        .limit(config.pagination.pageSize);

    const data = await query;

    if (data.length === config.pagination.pageSize) {
        const lastRecord = data[data.length - 1] as Service;
        const newPaginationToken = genPaginationToken(
            lastRecord.id,
            lastRecord.ts,
            PaginatedQueryType.Services,
        );
        return {
            items: data,
            paginationToken: newPaginationToken,
        };
    }
    logger.debug(`${JSON.stringify(data)}`);

    return {
        items: data,
    };
};

const getServicesByPublisherId = async (userId: string, paginationToken?: string) => {
    const query = connection('services')
        .where({ publisher_id: userId })
        .orderBy('ts')
        .orderBy('id')
        .modify(withPaginationToken, paginationToken)
        .limit(config.pagination.pageSize);

    const data = await query;

    if (data.length === config.pagination.pageSize) {
        const lastRecord = data[data.length - 1] as Service;
        const newPaginationToken = genPaginationToken(
            lastRecord.id,
            lastRecord.ts,
            PaginatedQueryType.Services,
        );
        return {
            items: data,
            paginationToken: newPaginationToken,
        };
    }
    return {
        items: data,
    };
};
export default { addService, getServices, getServicesByPublisherId };
