import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
class User {
    @Field((type) => ID)
    id!: string

    @Field()
    email!: string

    @Field((type) => [String])
    roles!: string[]
}

export { User }
