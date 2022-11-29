/* eslint-disable max-classes-per-file */
import { PaginatedResponse } from '@graphql/types';
import {
    ArgsType, Field, ID, ObjectType,
} from 'type-graphql';

@ArgsType()
class GetUsersArgs {
    @Field({ nullable: true })
        pagination_token?: string;
}

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

    @Field(() => Boolean)
        can_publish_services!: boolean;
}

@ObjectType()
class PaginatedUserResponse extends PaginatedResponse(User) {}

export { User, PaginatedUserResponse, GetUsersArgs };
