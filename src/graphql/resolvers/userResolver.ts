import {
    Arg,
    Authorized,
    Field,
    InputType,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql'
import { User } from '@graphql/schemas/user'
import { MaxLength, Length, ArrayMaxSize } from 'class-validator'

@InputType()
class NewUserInput {
    @Field()
    @MaxLength(128)
    email!: string

    @Field((type) => [String])
    @ArrayMaxSize(3)
    roles!: string[]
}

@Resolver(User)
class UserResolver {
    constructor() {}

    @Query((returns) => User)
    user(
        @Arg('id', { nullable: true }) id?: string,
        @Arg('email', { nullable: true }) email?: string
    ) {
        return {
            id: '89c526d6-7626-4656-a521-d030c1e745e2',
            email: 'naguerre@fi.uba.ar',
            roles: ['STUDENT'],
        }
    }

    @Mutation((returns) => User)
    // @Authorized()
    addUser(@Arg('newUserData') newUserData: NewUserInput): Promise<User> {
        console.log(newUserData)
        return Promise.resolve({
            id: '89c526d6-7626-4656-a521-d030c1e745e2',
            email: 'naguerre@fi.uba.ar',
            roles: ['STUDENT'],
        })
    }
}

export { UserResolver }
