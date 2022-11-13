import { buildSchema } from 'type-graphql'
import authChecker from './authChecker'
import { UserResolver } from './resolvers/userResolver'
import { SessionResolver } from './resolvers/sessionResolver'

const schema = buildSchema({
    resolvers: [UserResolver, SessionResolver],
    authChecker: authChecker,
})

export { schema }
