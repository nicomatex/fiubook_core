import { buildSchema } from 'type-graphql';
import authChecker from '@graphql/authChecker';
import UserResolver from '@graphql/resolvers/userResolver';
import SessionResolver from '@graphql/resolvers/sessionResolver';
import ServiceResolver from '@graphql/resolvers/serviceResolver';
import BookingResolver from '@graphql/resolvers/bookingResolver';
import MetricsResolver from '@graphql/resolvers/metricsResolver';
import NotificationResolver from '@graphql/resolvers/notificationResolver';

const schema = buildSchema({
    resolvers: [
        UserResolver,
        SessionResolver,
        ServiceResolver,
        BookingResolver,
        MetricsResolver,
        NotificationResolver,
    ],
    authChecker,
});

export default schema;
