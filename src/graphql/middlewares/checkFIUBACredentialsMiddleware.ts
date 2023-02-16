import { checkFIUBACredentials } from '@util/authUtil';
import { createError } from '@errors/errorParser';
import { MiddlewareFn } from 'type-graphql';

const CheckFiubaCredentialsGuard: MiddlewareFn = async ({ args }, next) => {
    const isFIUBAUserValid = await checkFIUBACredentials(
        args.credentials.dni,
        args.credentials.password,
    );
    if (!isFIUBAUserValid) {
        throw createError(
            404,
            "FIUBA user doesn't exists or password is wrong",
        );
    }
    return next();
};

export default CheckFiubaCredentialsGuard;
