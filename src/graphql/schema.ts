import { buildSchema } from 'type-graphql'
import authChecker from './authChecker'
import { UserResolver } from './resolvers/userResolver'

const schema = buildSchema({
    resolvers: [UserResolver],
    authChecker: authChecker,
})

export { schema }
