import config from '@config/default'
import { PaginatedUserResponse, User } from '@graphql/schemas/user'
import knex from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'postgres-array'
import { decodePaginationToken, genPaginationToken } from '@util/dbUtil'
import { PaginatedQueryType } from '@util/dbUtil'

const connection = knex({ ...config.knex })

const defaultRoles = ['STUDENT']

const addUser = async (dni: string): Promise<User> => {
    const id = uuidv4()
    const newUser = {
        id,
        dni,
        roles: defaultRoles,
    }
    const insertionResult = await connection('users')
        .insert(newUser)
        .returning('*')
    const insertedUser = insertionResult[0]

    insertedUser.roles = parse(insertedUser.roles)
    return insertedUser
}

const getUserByDNI = async (dni: string): Promise<User> => {
    const res = await connection('users').where({ dni })
    console.log(res)
    if (res.length === 0) throw new Error(`User with DNI ${dni} not found`)
    const user = res[0]

    // Parse postgres array into JS array
    user.roles = parse(user.roles)
    user.ts = user.ts.toISOString()
    return user
}

const getUserById = async (id: string): Promise<User> => {
    const res = await connection('users').where({ id })
    if (res.length === 0) throw new Error(`User with id ${id} not found`)
    const user = res[0]

    // Parse postgres array into JS array
    user.roles = parse(user.roles)

    return user
}

const getUsers = async (
    paginationToken?: string
): Promise<PaginatedUserResponse> => {
    let data
    if (paginationToken !== undefined) {
        const { id: previous_page_last_id, ts: previous_page_last_ts } =
            decodePaginationToken(paginationToken, PaginatedQueryType.Users)

        data = await connection('users')
            // Keyset Pagination condition
            .whereRaw(
                `(ts, id) > ('${previous_page_last_ts}','${previous_page_last_id}')`
            )
            .orderBy('ts')
            .orderBy('id')
            .limit(config.pagination.pageSize)
    } else {
        data = await connection('users')
            .orderBy('ts')
            .orderBy('id')
            .limit(config.pagination.pageSize)
    }

    data.forEach((user) => {
        user.roles = parse(user.roles)
    })

    if (data.length === config.pagination.pageSize) {
        const lastRecord = data[data.length - 1] as User
        const newPaginationToken = genPaginationToken(
            lastRecord.id,
            lastRecord.ts,
            PaginatedQueryType.Users
        )
        return {
            items: data,
            paginationToken: newPaginationToken,
        }
    }
    return { items: data }
}

export default { addUser, getUserByDNI, getUserById, getUsers }
