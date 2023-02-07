import { BookingStatus, BookingType, UniversityRole } from '@repositories/types';
import { MaxLength } from 'class-validator';
import {
    ClassType,
    Field,
    InputType,
    ObjectType,
    registerEnumType,
    ResolverData,
} from 'type-graphql';

type RoleTypes = 'ADMIN' | 'PUBLISHER' | 'BOOKING_ROLES'

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
    isLoggedIn: true
    userId: string
    roles: UniversityRole[]
    canPublishServices: boolean
    isAdmin: boolean
}

type NotLoggedInContextType = {
    isLoggedIn: false
}

type ContextType = LoggedInContextType | NotLoggedInContextType

type RoleChecker = ({
    root,
    args,
    context,
    info,
}: ResolverData<LoggedInContextType>) => Promise<boolean>

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
    description: 'Booking Status. CONFIRMED, PENDING_CONFIRMATION or CANCELLED',
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
};
