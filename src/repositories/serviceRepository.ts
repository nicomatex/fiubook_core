import config from '@config/default';
import Service, { CreateServiceArgs } from '@graphql/schemas/service';
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
        granularity: creationArgs.granularity.toString(),
    };

    const insertionResult = await connection('services').insert(newService).returning('*');
    const insertedService = insertionResult[0];
    return insertedService;
};

export default { addService };
