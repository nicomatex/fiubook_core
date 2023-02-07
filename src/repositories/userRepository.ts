import config from '@config/default';
import {
    PaginatedUserResponse,
    UpdateUserArgs,
    User,
} from '@graphql/schemas/user';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import {
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
} from '@util/dbUtil';
import adaptUser from '@repositories/dataAdapters/userDataAdapter';
import { DatabaseUser } from '@repositories/types';

const connection = knex({ ...config.knex });

const defaultRoles = ['STUDENT'];

const addUser = async (dni: string): Promise<DatabaseUser> => {
    const id = uuidv4();
    const newUser = {
        id,
        dni,
        roles: defaultRoles,
        can_publish_services: false,
        is_admin: false,
    };
    const insertionResult = await connection('users')
        .insert(newUser)
        .returning('*');
    const insertedUser = insertionResult[0];

    const parsedInsertedUser = adaptUser(insertedUser);
    return parsedInsertedUser;
};

// TODO: returning null might not be consistent with other parts of code, where an error is thrown
const getUserByDNI = async (dni: string): Promise<DatabaseUser | null> => {
    const res = await connection('users').where({ dni });
    if (res.length === 0) return null;
    const user = res[0];

    const parsedUser = adaptUser(user);
    return parsedUser;
};

const getUserById = async (id: string): Promise<DatabaseUser> => {
    const res = await connection('users').where({ id });
    if (res.length === 0) throw new Error(`User with id ${id} not found`);
    const user = res[0];

    const parsedUser = adaptUser(user);
    return parsedUser;
};

const getUsers = async (
    paginationToken?: string,
    pageSize?: number,
): Promise<DatabaseUser[]> => {
    const query = connection('users')
        .orderBy('ts')
        .orderBy('id')
        .modify(withPaginationToken, PaginatedQueryType.Users, paginationToken)
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptUser);

    return parsedData;
};

const updateUserById = async (
    userId: string,
    updateArgs: UpdateUserArgs,
): Promise<DatabaseUser> => {
    const query = connection('users')
        .where({ id: userId })
        .update(updateArgs)
        .returning('*');

    const res = await query;
    if (res.length === 0) throw new Error(`User with id ${userId} not found`);
    const user = res[0];

    const parsedUser = adaptUser(user);

    return parsedUser;
};

export default {
    addUser,
    getUserByDNI,
    getUserById,
    getUsers,
    updateUserById,
};
