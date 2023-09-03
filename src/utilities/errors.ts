class Unauthorized extends Error {
    name: string = 'Unauthorized';
    statusCode: number = 401;

    constructor(message = 'Invalid credentials') {
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

class Conflict extends Error {
    name: string = 'Duplicate';
    statusCode: number = 409;

    constructor(message = 'Duplicate resource found') {
        super(message);
    }
}

class UnprocessableEntity extends Error {
    name: string = 'Unprocessable Entity';
    statusCode: number = 422;

    constructor(message = 'Invalid input data') {
        super(message);
    }
}

export { Conflict, Forbidden, NotFound, Unauthorized, UnprocessableEntity };
