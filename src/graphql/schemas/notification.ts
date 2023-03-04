import { EdgesType, NotificationType, PageInfo } from '@graphql/types';
import { Field, ID, ObjectType } from 'type-graphql';
import { User } from '@graphql/schemas/user';
import { Booking } from '@graphql/schemas/booking';

@ObjectType()
class Notification {
    @Field(() => ID)
        id!: string;

    @Field()
        ts!: Date;

    @Field(() => ID)
        receiver_id!: string;

    @Field(() => User, { nullable: true })
        receiver?: User | null;

    @Field()
        type!: NotificationType;

    @Field(() => ID)
        booking_id!: string;

    @Field(() => Booking, { nullable: true })
        booking?: Booking | null;

    @Field()
        read!: boolean;
}

@ObjectType()
class NotificationsEdgeType extends EdgesType(Notification) {}

@ObjectType()
class PaginatedNotificationResponse {
    @Field(() => [NotificationsEdgeType])
        edges!: NotificationsEdgeType[];

    @Field(() => PageInfo)
        pageInfo!: PageInfo;
}

export { Notification, PaginatedNotificationResponse };
