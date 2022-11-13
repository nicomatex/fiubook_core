import { checkFIUBACredentials } from '@util/authUtil'
import { MiddlewareFn } from 'type-graphql'

const CheckFiubaCredentialsMiddleware: MiddlewareFn = async (
    { args },
    next
) => {
    const isFIUBAUserValid = await checkFIUBACredentials(
        args.credentials.dni,
        args.credentials.password
    )
    if (!isFIUBAUserValid) {
        throw new Error("FIUBA user doesn't exists or password is wrong")
    }
    return next()
}

export default CheckFiubaCredentialsMiddleware
