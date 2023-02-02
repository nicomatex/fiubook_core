/* eslint-disable max-classes-per-file */
import { PaginatedResponse } from '@graphql/types';
import {
    ArgsType, Field, ID, ObjectType,
} from 'type-graphql';

@ObjectType()
class User {
    @Field(() => ID)
        id!: string;

    @Field()
        ts!: Date;

    @Field()
        dni!: string;

    @Field(() => [String])
        roles!: string[];

    @Field(() => Boolean)
        can_publish_services!: boolean;

    is_admin!: boolean;
}

@ObjectType()
class PaginatedUserResponse extends PaginatedResponse(User) {}

export { User, PaginatedUserResponse };
