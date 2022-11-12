import config from '@config/development'
import { PaginatedUserResponse, User } from '@graphql/schemas/user'
import knex from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'postgres-array'
import { genPaginationToken } from '@util/dbUtil'
import { PaginatedQueryType } from '@util/dbUtil'
import type { PaginatedQueryResult } from '@repositories/types'

const connection = knex({ ...config.knex })

const addUser = async (email: string, roles: string[]): Promise<User> => {
    const id = uuidv4()
    const newUser = {
        id,
        email,
        roles,
    }
    const insertionResult = await connection('users')
        .insert(newUser)
        .returning('*')
    const insertedUser = insertionResult[0]
    return insertedUser
}

const getUserByEmail = async (email: string): Promise<User> => {
    const res = await connection('users').where({ email })
    console.log(res)
    if (res.length === 0) throw new Error(`User with email ${email} not found`)
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
    if (paginationToken !== undefined) {
    }
    const data = await connection('users')
        .orderBy('ts')
        .orderBy('id')
        .limit(config.pagination.pageSize)

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

export default { addUser, getUserByEmail, getUserById, getUsers }
