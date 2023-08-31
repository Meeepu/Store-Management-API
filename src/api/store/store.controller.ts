import { RequestHandler, Request } from 'express';
import { StoreCreate, StoreQuery } from './store.types';
import { Forbidden, UnprocessableEntity } from '../../utilities/errors';
import { UserRoles } from '../user/user.model';
import StoreModel, { Store } from './store.model';

export const getStore: RequestHandler = async (req, res) => {
    const { storeId } = req.params as StoreQuery;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    if (req.user?.role === UserRoles.ADMIN || req.store) {
        const store = req.store || (await StoreModel.findOne({ storeId }).populate('owner').lean().exec());
        return res.json(store);
    }

    throw new Forbidden();
};

export const getStores: RequestHandler = async (req, res) => {
    if (req.user?.role === UserRoles.ADMIN || req.store) {
        const query = req.store ? { owner: req.user?._id } : {};
        const stores = await StoreModel.find(query).populate('owner').lean().exec();
        
        return res.json(stores);
    }

    throw new Forbidden();
};

export const createStore: RequestHandler = async (req: Request<{}, {}, StoreCreate>, res) => {
    const { name, addressLine, city, province, region } = req.body;

    await StoreModel.create({
        name,
        location: { addressLine, city, province, region },
        owner: req.user?._id
    });

    res.sendStatus(201);
};

export const updateStore: RequestHandler = async (req: Request<{}, {}, StoreCreate>, res) => {
    const { storeId } = req.params as StoreQuery;
    const { name, addressLine, city, province, region } = req.body;

    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    const update: Store = {} as Store;
    if (name) update.name = name;
    if (addressLine) update.location.addressLine = addressLine;
    if (city) update.location.city = city;
    if (province) update.location.province = province;
    if (region) update.location.region = region;

    if (req.user?.role === UserRoles.ADMIN || req.store) {
        await StoreModel.updateOne({ storeId }, { $set: update });
        return res.sendStatus(204);
    }

    throw new Forbidden();
};

export const deleteStore: RequestHandler = async (req, res) => {
    const { storeId } = req.query as StoreQuery;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    if (req.user?.role === UserRoles.ADMIN || req.store) {
        await StoreModel.deleteOne({ storeId });
        return res.sendStatus(204);
    }

    throw new Forbidden();
};
