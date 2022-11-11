import config from '@config/development'
import { User } from '@graphql/schemas/user'
import knex from 'knex'
import { v4 as uuidv4 } from 'uuid'
import { parse } from 'postgres-array'

const connection = knex({ ...config.knex })

const addUser = async (email: string, roles: string[]): Promise<User> => {
    const id = uuidv4()
    const newUser = {
        id,
        email,
        roles,
    }
    await connection('users').insert(newUser)
    return newUser
}

const getUserByEmail = async (email: string): Promise<User> => {
    const res = await connection('users').where({ email })
    if (res.length === 0) throw new Error(`User with email ${email} not found`)
    const user = res[0]

    // Parse postgres array into JS array
    user.roles = parse(user.roles)

    return user
}

export default { addUser, getUserByEmail }
