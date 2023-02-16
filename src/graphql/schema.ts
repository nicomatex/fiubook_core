import { buildSchema } from 'type-graphql';
import authChecker from '@graphql/authChecker';
import UserResolver from '@graphql/resolvers/userResolver';
import SessionResolver from '@graphql/resolvers/sessionResolver';
import ServiceResolver from '@graphql/resolvers/serviceResolver';
import BookingResolver from '@graphql/resolvers/bookingResolver';
import MetricsResolver from '@graphql/resolvers/metricsResolver';

const schema = buildSchema({
    resolvers: [
        UserResolver,
        SessionResolver,
        ServiceResolver,
        BookingResolver,
        MetricsResolver,
    ],
    authChecker,
});

export default schema;
