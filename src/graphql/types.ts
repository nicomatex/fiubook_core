import { MaxLength } from 'class-validator';
import {
    ClassType,
    Field,
    InputType,
    Int,
    ObjectType,
    registerEnumType,
    ResolverData,
} from 'type-graphql';

type RoleTypes = 'ADMIN' | 'PUBLISHER' | 'BOOKING_ROLES';

enum BookingType {
    AUTOMATIC = 'AUTOMATIC',
    REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
}

enum UniversityRole {
    STUDENT = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    NODO = 'NODO',
}

enum BookingStatus {
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    PENDING_RETURN = 'PENDING_RETURN',
    RETURNED = 'RETURNED',
}

enum NotificationType {
    NEW_BOOKING_REQUEST = 'NEW_BOOKING_REQUEST',
    BOOKING_REQUEST_ACCEPTED = 'BOOKING_REQUEST_ACCEPTED',
    BOOKING_REQUEST_REJECTED = 'BOOKING_REQUEST_REJECTED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    BOOKING_REQUEST_CANCELLED = 'BOOKING_REQUEST_CANCELLED',
    OBJECT_RETURNED = 'OBJECT_RETURNED',
    OBJECT_DELIVERED = 'OBJECT_DELIVERED',
}

@ObjectType()
class PageInfo {
    @Field()
        hasNextPage!: boolean;

    @Field()
        hasPreviousPage!: boolean;

    @Field(() => String, { nullable: true })
        startCursor?: string | null;

    @Field(() => String, { nullable: true })
        endCursor?: string | null;

    @Field(() => Int)
        totalCount!: number;
}

function EdgesType<TItem>(itemFieldValue: ClassType<TItem>) {
    @ObjectType({ isAbstract: true })
    abstract class EdgesTypeClass {
        @Field(() => itemFieldValue)
            node!: TItem;

        @Field()
            cursor!: String;
    }

    return EdgesTypeClass;
}

type LoggedInContextType = {
    isLoggedIn: true;
    userId: string;
    roles: UniversityRole[];
    canPublishServices: boolean;
    isAdmin: boolean;
};

type NotLoggedInContextType = {
    isLoggedIn: false;
};

type ContextType = LoggedInContextType | NotLoggedInContextType;

type RoleChecker = ({
    root,
    args,
    context,
    info,
}: ResolverData<LoggedInContextType>) => Promise<boolean>;

@InputType()
class Credentials {
    @Field()
    @MaxLength(128)
        dni!: string;

    @Field()
    @MaxLength(128)
        password!: string;
}

// Required to use these enums in Type-GraphQL.
registerEnumType(BookingType, {
    name: 'BookingType',
    description:
        'Type of reservation. Either REQUIRES_CONFIRMATION or AUTOMATIC',
});

registerEnumType(UniversityRole, {
    name: 'UniversityRole',
    description: 'Unversity role. STUDENT, PROFESSOR or NODO',
});

registerEnumType(BookingStatus, {
    name: 'BookingStatus',
    description:
        'Booking Status. CONFIRMED, PENDING_CONFIRMATION, CANCELLED, PENDING_RETURN or RETURNED',
});

registerEnumType(NotificationType, {
    name: 'NotificationType',
    description:
        'Notification Type. NEW_BOOKING_REQUEST, BOOKING_REQUEST_ACCEPTED, BOOKING_REQUEST_REJECTED, BOOKING_CANCELLED or BOOKING_REQUEST_CANCELLED',
});

export {
    PageInfo,
    EdgesType,
    ContextType,
    Credentials,
    RoleChecker,
    RoleTypes,
    LoggedInContextType,
    NotLoggedInContextType,
    BookingType,
    UniversityRole,
    BookingStatus,
    NotificationType,
};
