import config from '@config/development'
import knex from 'knex'
import { v4 as uuidv4 } from 'uuid'

const connection = knex({
    ...config.knex,
})

const addUser = async (email: String, roles: String[]) => {
    const id = uuidv4()
    return connection('users').insert({ id, email, roles })
}
