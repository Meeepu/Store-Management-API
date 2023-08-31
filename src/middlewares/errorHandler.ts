import { Error } from 'mongoose';
import { ErrorRequestHandler } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    let { name = 'Internal server error', message = 'Something went wrong', statusCode = 500 } = err;

    console.log('🚀 ~ file: errorHandler.ts:11 ~ err:', err);

    if (err.code && err.code === 11000) {
        const [property, value] = <Array<string>>Object.entries(err.keyValue)[0];

        name = 'DuplicateError';
        message = `A ${property} of ${value} already exists`;
        statusCode = 409;
    }

    if (err instanceof Error.ValidationError) {
        message = Object.values(err.errors).map(({ path, message }) => ({
            path,
            message
        }));
        statusCode = 422;
    }

    if (err instanceof JsonWebTokenError) {
        name = 'Token is malformed';
        statusCode = 401;
    }

    if (err instanceof TokenExpiredError) {
        name = 'Token is expired';
        statusCode = 401;
    }

    res.status(statusCode).json({ name, message });
};

export default errorHandler;
