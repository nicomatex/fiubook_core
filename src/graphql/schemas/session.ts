import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
class Session {
    @Field()
        token!: string;
}

export default Session;
