import { RequestHandler, Request } from 'express';
import { StoreCreate, StoreQuery, StoreUpdate } from './store.types';
import { Forbidden, Unauthorized, UnprocessableEntity } from 'utilities/errors';
import { UserRoles } from '../user/user.model';
import StoreModel, { Store, StorePopulatedDocument } from './store.model';

export const getStores: RequestHandler = async (req, res) => {
    if (!req.user) throw new Unauthorized();

    const { storeId } = req.query as StoreQuery;

    let stores: StorePopulatedDocument[] | StorePopulatedDocument | null;

    if (req.user.role === UserRoles.ADMIN) {
        stores = storeId
            ? await StoreModel.findById(storeId).populate('owner')
            : await StoreModel.find().populate('owner');
    } else {
        stores = req.store ? req.store : await StoreModel.find({ owner: req.user._id }, { owner: 0 });
    }

    res.json(stores);
};

export const createStore: RequestHandler = async (req: Request<{}, {}, StoreCreate>, res) => {
    if (!req.user) throw new Unauthorized();

    const { name, addressLine, city, province, region } = req.body;

    await StoreModel.create({
        name,
        location: { addressLine, city, province, region },
        owner: req.user._id
    });

    res.sendStatus(201);
};

export const updateStore: RequestHandler = async (req: Request<{}, {}, StoreUpdate>, res) => {
    if (!req.user) throw new Unauthorized();

    const { storeId, name, addressLine, city, province, region } = req.body;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    const update: Store = {} as Store;
    if (name) update.name = name;
    if (addressLine) update.location.addressLine = addressLine;
    if (city) update.location.city = city;
    if (province) update.location.province = province;
    if (region) update.location.region = region;

    if (req.user.role === UserRoles.ADMIN || req.store) {
        await StoreModel.updateOne({ storeId }, { $set: update });
        return res.sendStatus(204);
    }

    throw new Forbidden();
};

export const deleteStore: RequestHandler = async (req, res) => {
    if (!req.user) throw new Unauthorized();

    const { storeId } = req.query as StoreQuery;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    if (req.user.role === UserRoles.ADMIN || req.store) {
        await StoreModel.deleteOne({ storeId });
        return res.sendStatus(204);
    }

    throw new Forbidden();
};
