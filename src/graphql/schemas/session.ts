import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
class Session {
    @Field(() => ID)
        token!: string;
}

export default Session;
