import { buildSchema } from 'type-graphql';
import authChecker from '@graphql/authChecker';
import UserResolver from '@graphql/resolvers/userResolver';
import SessionResolver from '@graphql/resolvers/sessionResolver';

const schema = buildSchema({
    resolvers: [UserResolver, SessionResolver],
    authChecker,
});

export default schema;
