import config from '@config/default';
import { CreateServiceArgs, PaginatedServiceResponse, Service } from '@graphql/schemas/service';
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
    const data = await connection('services').orderBy('ts').orderBy('id').limit(config.pagination.pageSize);
    logger.debug(`${JSON.stringify(data)}`);

    return {
        items: data,
        paginationToken: 'falopa',
    };
};
export default { addService, getServices };
