import { MaxLength } from 'class-validator';
import {
    ClassType,
    Field,
    InputType,
    ObjectType,
    registerEnumType,
    ResolverData,
} from 'type-graphql';

function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
    // `isAbstract` decorator option is mandatory to prevent registering in schema
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        // here we use the runtime argument
        @Field(() => [TItemClass])
        // and here the generic type
            items!: TItem[];

        @Field({ nullable: true })
            paginationToken?: string;
    }
    return PaginatedResponseClass;
}

type LoggedInContextType = {
    isLoggedIn: true
    userId: string
    roles: string[]
    canPublishServices: boolean
    isAdmin: boolean
}

type NotLoggedInContextType = {
    isLoggedIn: false
}

type ContextType = LoggedInContextType | NotLoggedInContextType;

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
type RoleTypes = 'ADMIN' | 'PUBLISHER' | 'BOOKING_ROLES'

enum BookingType{
    AUTOMATIC = 'AUTOMATIC',
    REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION'
}

enum UniversityRole{
    STUDENT = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    NODO = 'NODO',
}

// Required to use these enums in Type-GraphQL.
registerEnumType(BookingType, {
    name: 'BookingType',
    description: 'Type of reservation. Either REQUIRES_CONFIRMATION or AUTOMATIC',
});

registerEnumType(UniversityRole, {
    name: 'UniversityRole',
    description: 'Unversity role. STUDENT, PROFESSOR or NODO',
});

export {
    PaginatedResponse, ContextType, Credentials, RoleChecker,
    RoleTypes, LoggedInContextType, NotLoggedInContextType,
    BookingType, UniversityRole,
};
