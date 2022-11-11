import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/userResolver'

const schema = buildSchema({
    resolvers: [UserResolver],
})

export { schema }
