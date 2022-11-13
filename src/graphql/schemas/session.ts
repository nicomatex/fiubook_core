import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
class Session {
    @Field((type) => ID)
    token!: string
}

export { Session }
