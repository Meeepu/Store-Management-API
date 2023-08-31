import { RequestHandler } from 'express';

const asyncHandler =
    (func: RequestHandler): RequestHandler =>
    (req, res, next) =>
        Promise.resolve(func(req, res, next)).catch(next);

export default asyncHandler;
