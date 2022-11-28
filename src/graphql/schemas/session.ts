import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
class Session {
    @Field()
        id!: string;
}

export default Session;
