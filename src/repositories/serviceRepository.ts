import config from '@config/default';
import { CreateServiceArgs, PaginatedServiceResponse, Service } from '@graphql/schemas/service';
import { decodePaginationToken, genPaginationToken, PaginatedQueryType } from '@util/dbUtil';
import logger from '@util/logger';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';

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

    const insertionResult = await connection('services').insert(newService).returning('*');
    const insertedService = insertionResult[0];
    return insertedService;
};

const getServices = async (
    paginationToken?: string,
): Promise<PaginatedServiceResponse> => {
    let data;

    if (paginationToken !== undefined) {
        const paginationInfo = decodePaginationToken(paginationToken, PaginatedQueryType.Services);
        const { ts: previousPageLastTs, id: previousPageLastId } = paginationInfo;
        data = await connection('services')
            // Keyset Pagination condition
            .whereRaw(
                `(ts, id) > ('${previousPageLastTs}','${previousPageLastId}')`,
            )
            .orderBy('ts')
            .orderBy('id')
            .limit(config.pagination.pageSize);
    } else {
        data = await connection('services').orderBy('ts').orderBy('id').limit(config.pagination.pageSize);
    }

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
export default { addService, getServices };
