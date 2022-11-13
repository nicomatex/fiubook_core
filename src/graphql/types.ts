import { MaxLength } from 'class-validator'
import { ClassType, Field, InputType, ObjectType } from 'type-graphql'

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

type ContextType =
    | {
          isLoggedIn: true
          userId: string
          roles: string[]
      }
    | {
          isLoggedIn: false
      }

@InputType()
class Credentials {
    @Field()
    @MaxLength(128)
    dni!: string

    @Field()
    @MaxLength(128)
    password!: string
}

export { PaginatedResponse, ContextType, Credentials }