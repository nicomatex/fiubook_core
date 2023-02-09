/* eslint-disable max-classes-per-file */
import { EdgesType, PageInfo } from '@graphql/types';
import {
    Field, ID, InputType, ObjectType,
} from 'type-graphql';

@InputType()
export class UpdateUserArgs {
    @Field(() => Boolean, { nullable: true })
        is_admin?: boolean;

    @Field(() => Boolean, { nullable: true })
        can_publish_services?: boolean;
}

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

    @Field(() => Boolean)
        is_admin!: boolean;
}

@ObjectType()
class UsersEdgesType extends EdgesType(User) {}

@ObjectType()
class PaginatedUserResponse {
    @Field(() => [UsersEdgesType])
        edges!: UsersEdgesType[];

    @Field(() => PageInfo)
        pageInfo!: PageInfo;
}

export { User, PaginatedUserResponse };
