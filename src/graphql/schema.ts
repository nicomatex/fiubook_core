import { buildSchema } from 'type-graphql';
import authChecker from '@graphql/authChecker';
import UserResolver from '@graphql/resolvers/userResolver';
import SessionResolver from '@graphql/resolvers/sessionResolver';
import ServiceResolver from '@graphql/resolvers/serviceResolver';

const schema = buildSchema({
    resolvers: [UserResolver, SessionResolver, ServiceResolver],
    authChecker,
});

export default schema;
