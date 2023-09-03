import StoreModel, { Store } from '../../src/api/store/store.model';
import genUsers, { TestUser } from './users';

export type TestStore = Omit<Store, 'storeId'> & { owner: TestUser; storeId?: string };

export default async (users: TestUser[] | undefined = undefined) => {
    users = users || (await genUsers());
    const stores: TestStore[] = [];

    for (let i = 0; i < users.length; i++) {
        // Get the current user
        const user = users[i];

        // Generate a random count between 3 and 5
        const count = (3 + Math.random() * 3) | 0;

        // Loop for the generated count
        for (let j = 0; j < count; j++) {
            // Create a store object
            const store: TestStore = {
                name: `${user.name.last}'s Store ${j + 1}`,
                owner: user,
                location: {
                    addressLine: `address line ${i + 1}-${j + 1})`,
                    city: `city ${i + 1}-${j + 1})`,
                    province: `province ${i + 1}-${j + 1})`,
                    region: `region ${i + 1}-${j + 1})`
                }
            };

            // Create a new store record in the database
            const storeDocument = await StoreModel.create({
                ...store,
                owner: user.objectId
            });

            // Set the storeId property of the 'store' to the value of the 'storeId' property of the 'storeDocument'
            store.storeId = storeDocument.storeId;

            // Add the store to the stores array
            stores.push(store);
        }
    }

    return stores;
};
