import 'reflect-metadata'
import express from 'express'
import { schema } from '@graphql/schema'
import { graphqlHTTP } from 'express-graphql'

const app = express()

app.get('/', async (req, res) => {
    res.status(200).send('Hola mundo')
})

app.use(
    '/graph',
    graphqlHTTP(async (req) => {
        const { authorization } = req.headers

        // if (!authorization) {
        //     throw new Error('Unauthorized')
        // }

        const secret = 'Falopa'

        return {
            schema: await schema,
            graphiql: {
                headerEditorEnabled: true,
            },
            context: {
                secret,
            },
        }
    })
)

app.listen(3000, () => {
    console.log('App listening on 3000')
})
