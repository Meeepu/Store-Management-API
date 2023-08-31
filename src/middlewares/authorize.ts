import { RequestHandler } from 'express';
import { UserRoles } from '../api/user/user.model';
import { Forbidden } from '../utilities/errors';

export const onlyAdmin: RequestHandler = (req, _res, next) => {
    if (req.user?.role === UserRoles.ADMIN) return next();

    next(new Forbidden('This action requires admin privileges'));
};
