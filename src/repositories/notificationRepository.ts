import config from '@config/default';
import { Notification } from '@graphql/schemas/notification';
import { NotificationType } from '@graphql/types';
import knex from 'knex';
import { v4 as uuidv4 } from 'uuid';
import adapt from '@repositories/dataAdapters/notificationDataAdapter';
import {
    genPaginatedResponse,
    PaginatedQueryType,
    withPaginationToken,
} from '@util/dbUtil';

const connection = knex({ ...config.knex });

const createNotification = async (
    receiverId: string,
    bookingId: string,
    type: NotificationType,
): Promise<Notification> => {
    const id = uuidv4();
    const newNotification = {
        id,
        receiver_id: receiverId,
        type,
        booking_id: bookingId,
    };
    const insertionResult = await connection('notifications')
        .insert(newNotification)
        .returning('*');
    const insertedNotification = insertionResult[0];

    const parsedInsertedNotification = adapt(insertedNotification);
    return parsedInsertedNotification;
};

const getNotifications = async (
    receiverId: string,
    paginationToken?: string,
    pageSize?: number,
) => {
    const coalescedPageSize = pageSize ?? config.pagination.pageSize;
    const query = connection('notifications')
        .where({ receiver_id: receiverId })
        .orderBy('ts', 'desc')
        .orderBy('id')
        .modify(
            withPaginationToken,
            PaginatedQueryType.Notifications,
            paginationToken,
            true,
        )
        .limit(coalescedPageSize + 1);

    const countQuery = connection('notifications')
        .where({ receiver_id: receiverId })
        .andWhere('read', false)
        .count();

    const totalCount = parseInt((await countQuery)[0].count as string, 10);

    const notifications = await query;
    const returnedCount = notifications.length;
    const parsedNotifications = notifications
        .slice(0, coalescedPageSize)
        .map(adapt);

    return genPaginatedResponse(
        parsedNotifications,
        returnedCount === coalescedPageSize + 1,
        PaginatedQueryType.Notifications,
        totalCount,
    );
};

const markAsRead = async (receiverId: string, until: Date) => {
    const query = connection('notifications')
        .where({ receiver_id: receiverId })
        .andWhere('ts', '<=', until)
        .update({ read: true })
        .returning('*');

    const updatedNotifications = await query;
    const parsedNotifications = updatedNotifications.map(adapt);
    return parsedNotifications;
};

// eslint-disable-next-line import/prefer-default-export
export default { createNotification, getNotifications, markAsRead };
