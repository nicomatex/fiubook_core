import { MaxLength } from 'class-validator'
import {
    ClassType,
    Field,
    InputType,
    ObjectType,
    ResolverData,
} from 'type-graphql'

function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
    // `isAbstract` decorator option is mandatory to prevent registering in schema
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        // here we use the runtime argument
        @Field((type) => [TItemClass])
        // and here the generic type
        items!: TItem[]

        @Field({ nullable: true })
        paginationToken?: string
    }
    return PaginatedResponseClass
}

type LoggedInContextType = {
    isLoggedIn: true
    userId: string
    roles: string[]
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
}: ResolverData<ContextType>) => boolean

@InputType()
class Credentials {
    @Field()
    @MaxLength(128)
    dni!: string

    @Field()
    @MaxLength(128)
    password!: string
}

type RoleTypes = 'ADMIN' | 'STUDENT' | 'PROFESSOR' | 'NODO' | 'LOGGED_IN'

export { PaginatedResponse, ContextType, Credentials, RoleChecker, RoleTypes, LoggedInContextType, NotLoggedInContextType }
