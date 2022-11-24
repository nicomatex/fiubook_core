/* eslint-disable max-classes-per-file */
import { PaginatedResponse } from '@graphql/types';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
class User {
    @Field(() => ID)
        id!: string;

    @Field()
        ts!: string;

    @Field()
        dni!: string;

    @Field(() => [String])
        roles!: string[];
}

@ObjectType()
class PaginatedUserResponse extends PaginatedResponse(User) {}

export { User, PaginatedUserResponse };
