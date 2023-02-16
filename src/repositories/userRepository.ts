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
import { createError } from '@errors/errorParser';
import { UsersMetrics } from '@graphql/schemas/metrics';
import logger from '@util/logger';

const connection = knex({ ...config.knex });

const defaultRoles = ['STUDENT'];

const addUser = async (dni: string): Promise<User> => {
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

const getUserByDNI = async (dni: string): Promise<User | null> => {
    const res = await connection('users').where({ dni });
    if (res.length === 0) return null;
    const user = res[0];

    const parsedUser = adaptUser(user);
    return parsedUser;
};

const getUserById = async (id: string): Promise<User> => {
    const res = await connection('users').where({ id });
    if (res.length === 0) throw createError(404, `User with id ${id} not found`);
    const user = res[0];

    const parsedUser = adaptUser(user);
    return parsedUser;
};

const getUsers = async (
    paginationToken?: string,
    pageSize?: number,
): Promise<PaginatedUserResponse> => {
    const query = connection('users')
        .orderBy('ts')
        .orderBy('id')
        .modify(withPaginationToken, PaginatedQueryType.Users, paginationToken)
        .limit(pageSize ?? config.pagination.pageSize);

    const data = await query;

    const parsedData = data.map(adaptUser);

    return genPaginatedResponse(
        parsedData,
        pageSize ?? config.pagination.pageSize,
        PaginatedQueryType.Users,
    );
};

const updateUserById = async (userId: string, updateArgs: UpdateUserArgs) => {
    const query = connection('users')
        .where({ id: userId })
        .update(updateArgs)
        .returning('*');

    const res = await query;
    if (res.length === 0) throw createError(404, `User with id ${userId} not found`);
    const user = res[0];

    const parsedUser = adaptUser(user);

    return parsedUser;
};

const getUsersMetrics = async (): Promise<UsersMetrics> => {
    const userCount = parseInt(
        (await connection('users').count())[0].count as string,
        10,
    );

    logger.info(`User count is ${JSON.stringify(userCount)}`);

    const professorCount = parseInt(
        (
            await connection('users').whereRaw("'PROFESSOR'=ANY(roles)").count()
        )[0].count as string,
        10,
    );

    const studentCount = parseInt(
        (await connection('users').whereRaw("'STUDENT'=ANY(roles)").count())[0]
            .count as string,
        10,
    );

    const nodoCount = parseInt(
        (await connection('users').whereRaw("'NODO'=ANY(roles)").count())[0]
            .count as string,
        10,
    );

    const bannedCount = parseInt(
        (await connection('users').where({ is_banned: true }).count())[0]
            .count as string,
        10,
    );

    return {
        user_count: userCount,
        professor_count: professorCount,
        student_count: studentCount,
        nodo_count: nodoCount,
        banned_count: bannedCount,
    };
};

export default {
    addUser,
    getUserByDNI,
    getUserById,
    getUsers,
    updateUserById,
    getUsersMetrics,
};
