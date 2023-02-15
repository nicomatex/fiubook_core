export const createError = (statusCode: number, message: string) => {
    return new Error(JSON.stringify({ message, statusCode }));
};

export const parseError = ({ message }: { message: string }) => {
    return JSON.parse(message);
};
