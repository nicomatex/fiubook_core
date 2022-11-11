import express from 'express'
import knex from 'knex'
import axios from 'axios'
import config from '@config/development'

const app = express()

const port = parseInt(process.env.database_port ?? '0')

const knex_connection = knex({
    ...config.knex,
})

app.get('/', async (req, res) => {
    const user_data = {
        id: 'f40b876d-27ef-456d-925a-6ae5c10cefef',
        email: 'yhuang@fi.uba.ar',
        roles: ['STUDENT', 'PROFESSOR'],
    }
    try {
        const insertion = await knex_connection('users').insert(user_data)
        res.status(200).send('Inserted successfully')
    } catch (e) {
        res.status(200).send(`Error ${e}`)
    }
})

app.listen(3000, () => {
    console.log('App listening on 3000')
    console.log(knex_connection.client.connectionSettings)
})
