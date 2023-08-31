import { RequestHandler } from 'express';
import { UserRoles } from '../api/user/user.model';
import { Forbidden } from 'utilities/errors';
import StoreModel, { StoreDocument } from '../api/store/store.model';

export const admin: RequestHandler = (req, _res, next) => {
    if (req.user?.role === UserRoles.ADMIN) return next();

    next(new Forbidden('This action requires admin privileges'));
};

export const owner: RequestHandler = async (req, _res, next) => {
    const { storeId } = req.body || req.query;
    try {
        const store: StoreDocument | null = await StoreModel.findOne({ storeId, owner: req.user?._id })
            .populate('owner')
            .exec();
        if (store === null) throw new Forbidden();

        req.store = store;
    } catch {
    } finally {
        next();
    }
};
