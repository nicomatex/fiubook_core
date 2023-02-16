import logger from '@util/logger';

export const createError = (statusCode: number, message: string) => {
    return new Error(JSON.stringify({ message, statusCode }));
};

export const parseError = (error: any) => {
    let parsedError;

    try {
        parsedError = JSON.parse(error.message);
    } catch (e) {
        logger.error(`Error while parsing error: ${JSON.stringify(error)}`);
        parsedError = error;
    }

    return parsedError;
};
