import { Error } from 'mongoose';
import { ErrorRequestHandler } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // Destructure the error object and provide default values if properties are missing
    let { name = 'Internal server error', message = 'Something went wrong', statusCode = 500 } = err;

    // Log the error for debugging purposes
    console.log('🚀 ~ file: errorHandler.ts:11 ~ err:', err);

    // Check if the error is a duplicate key error
    if (err.code && err.code === 11000) {
        // Extract the first key-value pair from the error's keyValue object
        const [property, value] = <Array<string>>Object.entries(err.keyValue)[0];

        // Update the name, message, and statusCode accordingly
        name = 'DuplicateError';
        message = `A ${property} of ${value} already exists`;
        statusCode = 409;
    }

    // Check if the error is a validation error
    if (err instanceof Error.ValidationError) {
        // Map the error messages to an array of objects containing the path and message
        message = Object.values(err.errors).map(({ path, message }) => ({
            path,
            message
        }));
        statusCode = 422;
    }

    // Check if the error is a JsonWebTokenError
    if (err instanceof JsonWebTokenError) {
        // Update the name and statusCode accordingly
        name = 'Token is malformed';
        statusCode = 401;
    }

    // Check if the error is a TokenExpiredError
    if (err instanceof TokenExpiredError) {
        // Update the name and statusCode accordingly
        name = 'Token is expired';
        statusCode = 401;
    }

    // Set the status code and send the response with the updated name and message
    res.status(statusCode).json({ name, message });
};

export default errorHandler;
