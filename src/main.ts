import 'reflect-metadata'
import express from 'express'
import knex from 'knex'
import config from '@config/development'
import { schema } from '@graphql/schema'
import { graphqlHTTP } from 'express-graphql'

const app = express()

app.get('/', async (req, res) => {
    res.status(200).send('Hola mundo')
})

const apply_schema = async () => {
    app.use(
        '/graph',
        graphqlHTTP({
            schema: await schema,
            graphiql: true,
        })
    )
}

apply_schema()

app.listen(3000, () => {
    console.log('App listening on 3000')
})
