import config from '@config/default';
import { PaginatedUserResponse, User } from '@graphql/schemas/user';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'postgres-array';
import { decodePaginationToken, genPaginationToken, PaginatedQueryType } from '@util/dbUtil';

const connection = knex({ ...config.knex });

const defaultRoles = ['STUDENT'];

const addUser = async (dni: string): Promise<User> => {
    const id = uuidv4();
    const newUser = {
        id,
        dni,
        roles: defaultRoles,
        can_publish_services: false,
    };
    const insertionResult = await connection('users')
        .insert(newUser)
        .returning('*');
    const insertedUser = insertionResult[0];

    insertedUser.roles = parse(insertedUser.roles);
    return insertedUser;
};

const getUserByDNI = async (dni: string): Promise<User|null> => {
    const res = await connection('users').where({ dni });
    if (res.length === 0) return null;
    const user = res[0];

    // Parse postgres array into JS array
    user.roles = parse(user.roles);
    user.ts = user.ts.toISOString();
    return user;
};

const getUserById = async (id: string): Promise<User> => {
    const res = await connection('users').where({ id });
    if (res.length === 0) throw new Error(`User with id ${id} not found`);
    const user = res[0];

    // Parse postgres array into JS array
    user.roles = parse(user.roles);
    return user;
};

const getUsers = async (
    paginationToken?: string,
): Promise<PaginatedUserResponse> => {
    let data;
    if (paginationToken !== undefined) {
        const paginationInfo = decodePaginationToken(paginationToken, PaginatedQueryType.Users);
        const { ts: previousPageLastTs, id: previousPageLastId } = paginationInfo;

        data = await connection('users')
            // Keyset Pagination condition
            .whereRaw(
                `(ts, id) > ('${previousPageLastTs}','${previousPageLastId}')`,
            )
            .orderBy('ts')
            .orderBy('id')
            .limit(config.pagination.pageSize);
    } else {
        data = await connection('users')
            .orderBy('ts')
            .orderBy('id')
            .limit(config.pagination.pageSize);
    }

    data.forEach((user) => {
        // eslint-disable-next-line no-param-reassign
        user.roles = parse(user.roles);
    });

    if (data.length === config.pagination.pageSize) {
        const lastRecord = data[data.length - 1] as User;
        const newPaginationToken = genPaginationToken(
            lastRecord.id,
            lastRecord.ts,
            PaginatedQueryType.Users,
        );
        return {
            items: data,
            paginationToken: newPaginationToken,
        };
    }
    return { items: data };
};

export default {
    addUser, getUserByDNI, getUserById, getUsers,
};
