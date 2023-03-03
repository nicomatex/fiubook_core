/* eslint-disable class-methods-use-this */
import { Booking } from '@graphql/schemas/booking';
import {
    Notification,
    PaginatedNotificationResponse,
} from '@graphql/schemas/notification';
import { User } from '@graphql/schemas/user';
import { LoggedInContextType } from '@graphql/types';
import bookingRepository from '@repositories/bookingRepository';
import notificationRepository from '@repositories/notificationRepository';
import userRepository from '@repositories/userRepository';
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';

@Resolver(() => Notification)
class NotificationResolver {
    @Query(() => PaginatedNotificationResponse)
    @Authorized()
    async notifications(
        @Ctx() ctx: LoggedInContextType,
        @Arg('after', { nullable: true }) paginationToken?: string,
        @Arg('first', { nullable: true }) pageSize?: number,
    ) {
        const notifications = await notificationRepository.getNotifications(
            ctx.userId,
            paginationToken,
            pageSize,
        );
        return notifications;
    }

    @Mutation(() => Boolean)
    @Authorized()
    async markAsRead(
        @Ctx() ctx: LoggedInContextType,
        @Arg('until') until: Date,
    ) {
        await notificationRepository.markAsRead(ctx.userId, until);
        return true;
    }

    @FieldResolver(() => User)
    async receiver(@Root() notification: Notification) {
        const user = await userRepository.getUserById(notification.receiver_id);
        return user;
    }

    @FieldResolver(() => Booking)
    async booking(@Root() notification: Notification) {
        const booking = await bookingRepository.getBookingById(
            notification.booking_id,
        );
        return booking;
    }
}

export default NotificationResolver;
