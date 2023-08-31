import { RequestHandler, Request } from 'express';
import { StoreCreate, StoreQuery } from './store.types';
import { Forbidden, NotFound, UnprocessableEntity } from '../../utilities/errors';
import { UserRoles } from '../user/user.model';
import StoreModel, { StoreDocument, StorePopulatedDocument } from './store.model';
export const getStore: RequestHandler = async (req, res) => {
    const { storeId } = req.params as StoreQuery;

    // Check if the storeId is undefined, and throw an error if it is
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    // Find the store document
    const store: StoreDocument | null = await StoreModel.findOne({ storeId });

    // If the store document is null, throw an error
    if (store === null) throw new NotFound('Store not found');

    // Check if the current user is the owner of the store
    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();

    // Check if the current user is an admin or the owner of the store
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        // Populate the 'owner' field of the store document with the selected fields ('userId', 'name', 'role')
        const populatedStore: StorePopulatedDocument = await store.populate({
            path: 'owner',
            select: 'userId name role'
        });

        // Return the populated store document as a JSON response
        return res.json(populatedStore);
    }

    // If the current user is not an admin or the owner of the store, throw an error
    throw new Forbidden('You are not the owner of this store');
};

export const getStores: RequestHandler = async (req, res) => {
    // Check if the user's role is ADMIN
    const isAdmin = req.user?.role === UserRoles.ADMIN;

    // Create a query object based on the user's role
    // If the user is an ADMIN, the query will be an empty object
    // If the user is not an ADMIN, the query will have a "owner" field with the user's ID
    const query = isAdmin ? {} : { owner: req.user?._id };

    // Find all stores that match the query
    const stores: StorePopulatedDocument[] = await StoreModel.find(query)
        // Populate the "owner" field with the user's ID, name, and role
        .populate({ path: 'owner', select: 'userId name role' })
        .lean() // Convert the result to plain JavaScript objects
        .exec();

    // Send the resulting stores as JSON response
    res.json(stores);
};

export const createStore: RequestHandler = async (req: Request<{}, {}, StoreCreate>, res) => {
    const { name, addressLine, city, province, region } = req.body;

    // Create a new document in the StoreModel collection
    await StoreModel.create({
        name,
        location: { addressLine, city, province, region },
        // Set the owner property to the ID of the authenticated user
        owner: req.user?._id
    });

    // Send a 201 status code indicating successful creation
    res.sendStatus(201);
};

export const updateStore: RequestHandler = async (req: Request<{}, {}, StoreCreate>, res) => {
    // Extract request data
    const { storeId } = req.params as StoreQuery;
    const { name, addressLine, city, province, region } = req.body;

    // Check if the `storeId` is undefined, and throw an error if it is
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    // Find the store with the given `storeId`
    const store: StoreDocument | null = await StoreModel.findOne({ storeId });

    // If the store doesn't exist, throw an error
    if (store === null) throw new NotFound('Store not found');

    // Check if the current user is the owner of the store
    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();

    // Check if the current user is an admin or the owner of the store
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        // Update the store's properties if the corresponding values are provided
        if (name) store.name = name;
        if (addressLine) store.location.addressLine = addressLine;
        if (city) store.location.city = city;
        if (province) store.location.province = province;
        if (region) store.location.region = region;

        // Save the updated store to the database
        await store.save();

        // Return a 204 (No Content) status code indicating a successful update
        return res.sendStatus(204);
    }

    // Throw an error if the current user is not an admin or the owner of the store
    throw new Forbidden('You are not the owner of this store');
};

export const deleteStore: RequestHandler = async (req, res) => {
    const { storeId } = req.params as StoreQuery;

    // Check if `storeId` is undefined, and throw an error if it is
    if (storeId === undefined) throw new UnprocessableEntity('Store ID is required');

    // Find a store document using the `storeId`
    const store: StoreDocument | null = await StoreModel.findOne({ storeId });

    // Check if no store is found, and throw an error
    if (store === null) throw new NotFound('Store not found');

    // Check if the current user is the owner of the store
    const isOwner: boolean = req.user?._id.toString() === store.owner.toString();

    // Check if the current user is an admin or the owner of the store
    if (req.user?.role === UserRoles.ADMIN || isOwner) {
        // Delete the store from the database
        await StoreModel.deleteOne({ storeId });

        // Send a success status code (204) back to the client
        return res.sendStatus(204);
    }

    // Throw an error if the current user is not an admin or the owner of the store
    throw new Forbidden('You are not the owner of this store');
};
