import 'reflect-metadata'
import express from 'express'
import { schema } from '@graphql/schema'
import { graphqlHTTP } from 'express-graphql'
import { buildContext } from '@util/contextUtil'
const app = express()

app.get('/', async (req, res) => {
    res.status(200).send('Hola mundo')
})

app.use(
    '/graph',
    graphqlHTTP(async (req) => {
        const context = buildContext(req.headers)
        return {
            schema: await schema,
            graphiql: {
                headerEditorEnabled: true,
            },
            context,
        }
    })
)

app.listen(3000, () => {
    console.log('App listening on 3000')
})
