/**
 * @openapi
 * components:
 *  schemas:
 *    ErrorResponse:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        message:
 *          type: string
 */
class Conflict extends Error {
    name: string = 'Duplicate';
    statusCode: number = 409;

    constructor(message = 'Duplicate resource found') {
        super(message);
    }
}

class Forbidden extends Error {
    name: string = 'Forbidden';
    statusCode: number = 403;

    constructor(message = 'Invalid action') {
        super(message);
    }
}

class NotFound extends Error {
    name: string = 'Not Found';
    statusCode: number = 404;

    constructor(message = 'Resource not existing') {
        super(message);
    }
}

class Unauthorized extends Error {
    name: string = 'Unauthorized';
    statusCode: number = 401;

    constructor(message = 'Invalid credentials') {
        super(message);
    }
}

/**
 * @openapi
 * components:
 *  responses:
 *    ValidationError:
 *      description: Invalid input data
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              message:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    path:
 *                      type: string
 *                    message:
 *                      type: string
 */
class UnprocessableEntity extends Error {
    name: string = 'Unprocessable Entity';
    statusCode: number = 422;

    constructor(message = 'Invalid input data') {
        super(message);
    }
}

export { Conflict, Forbidden, NotFound, Unauthorized, UnprocessableEntity };
