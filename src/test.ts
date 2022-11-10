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
    res.status(200).send('Eskere')
    const response = await axios.get('https://www.google.com')
    console.log(response)
})

app.listen(3000, () => {
    console.log('App listening on 3000')
    console.log(knex_connection.client.connectionSettings)
})
