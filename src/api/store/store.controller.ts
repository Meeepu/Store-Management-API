import { RequestHandler, Request } from 'express';
import { StoreCreate, StoreQuery } from './store.types';
import { Forbidden, NotFound, UnprocessableEntity } from '../../utilities/errors';
import { UserRoles } from '../user/user.model';
import StoreModel, { StoreDocument, StorePopulatedDocument } from './store.model';

export const getStore: RequestHandler = async (req, res) => {
    const { storeId } = req.params as StoreQuery;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    const store: StoreDocument | null = await StoreModel.findOne({ storeId });
    if (store === null) throw new NotFound('Store not found');

    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        const populatedStore: StorePopulatedDocument = await store.populate({
            path: 'owner',
            select: 'userId name role'
        });
        return res.json(populatedStore);
    }

    throw new Forbidden('You are not the owner of this store');
};

export const getStores: RequestHandler = async (req, res) => {
    const query = req.user?.role === UserRoles.ADMIN ? {} : { owner: req.user?._id };

    const stores: StorePopulatedDocument[] = await StoreModel.find(query)
        .populate({ path: 'owner', select: 'userId name role' })
        .lean()
        .exec();

    res.json(stores);
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

    const store: StoreDocument | null = await StoreModel.findOne({ storeId });
    if (store === null) throw new NotFound('Store not found');

    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        if (name) store.name = name;
        if (addressLine) store.location.addressLine = addressLine;
        if (city) store.location.city = city;
        if (province) store.location.province = province;
        if (region) store.location.region = region;

        await store.save();
        return res.sendStatus(204);
    }

    throw new Forbidden('You are not the owner of this store');
};

export const deleteStore: RequestHandler = async (req, res) => {
    const { storeId } = req.params as StoreQuery;
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    const store: StoreDocument | null = await StoreModel.findOne({ storeId });
    if (store === null) throw new NotFound('Store not found');

    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        await StoreModel.deleteOne({ storeId });
        return res.sendStatus(204);
    }

    throw new Forbidden('You are not the owner of this store');
};
