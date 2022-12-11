import config from '@config/default';
import { CreateServiceArgs, PaginatedServiceResponse, Service } from '@graphql/schemas/service';
import { decodePaginationToken, genPaginationToken, PaginatedQueryType } from '@util/dbUtil';
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
    let query = connection('services')
        .orderBy('ts')
        .orderBy('id')
        .limit(config.pagination.pageSize);

    if (paginationToken !== undefined) {
        const paginationInfo = decodePaginationToken(paginationToken, PaginatedQueryType.Services);
        const { ts: previousPageLastTs, id: previousPageLastId } = paginationInfo;
        query = query.whereRaw(`(ts, id) > ('${previousPageLastTs}','${previousPageLastId}')`);
    }

    if (queryTerm !== undefined) {
        query = query.whereRaw('search_index @@ to_tsquery(\'spanish\',?)', [queryEscaper(queryTerm)]);
    }

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

const getServicesByUserId = async (userId: string, paginationToken?: string) => {
    let query = connection('services')
        .where({ publisher_id: userId })
        .orderBy('ts')
        .orderBy('id')
        .limit(config.pagination.pageSize);

    if (paginationToken !== undefined) {
        // Pagination Token available
        const paginationInfo = decodePaginationToken(paginationToken, PaginatedQueryType.Services);
        const { ts: previousPageLastTs, id: previousPageLastId } = paginationInfo;

        query = query
        // Keyset Pagination condition
            .whereRaw(
                `(ts, id) > ('${previousPageLastTs}','${previousPageLastId}')`,
            );
    }

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
export default { addService, getServices, getServicesByUserId };
