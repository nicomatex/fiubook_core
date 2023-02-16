/* eslint-disable max-classes-per-file */
import { EdgesType, PageInfo, UniversityRole } from '@graphql/types';
import {
    Field, ID, InputType, ObjectType,
} from 'type-graphql';

@InputType()
export class UpdateUserArgs {
    @Field(() => Boolean, { nullable: true })
        is_admin?: boolean;

    @Field(() => Boolean, { nullable: true })
        can_publish_services?: boolean;

    @Field(() => [UniversityRole], { nullable: true })
        roles?: UniversityRole[];

    @Field(() => Boolean, { nullable: true })
        is_banned?: boolean;
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
        roles!: UniversityRole[];

    @Field(() => Boolean)
        can_publish_services!: boolean;

    @Field(() => Boolean)
        is_admin!: boolean;

    @Field(() => Boolean)
        is_banned?: boolean;
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
