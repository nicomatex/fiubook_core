import { Notification } from '@graphql/schemas/notification';
import { NotificationType } from '@graphql/types';

export type RawNotification = {
    id: string;
    ts: Date;
    receiver_id: string;
    type: NotificationType;
    booking_id: string;
    read: boolean;
};

const adapt = (rawNotification: RawNotification): Notification => ({
    ...rawNotification,
});

export default adapt;
