import UserModel, { UserRoles } from '../src/api/user/user.model';
import StoreModel from '../src/api/store/store.model';
import envs from '../src/utilities/envs';
import genStores from './generators/stores';

beforeEach(async () => {
    // Reset the database
    await UserModel.deleteMany({});
    await StoreModel.deleteMany({});

    // Find a document in the UserModel collection that has the role "ADMIN" and update it
    // If no document is found, create a new document with the specified data
    await UserModel.findOneAndUpdate(
        { role: UserRoles.ADMIN },
        {
            // Update the name field of the document
            name: {
                first: 'Admin',
                last: 'User'
            },
            // Update the credentials field of the document
            credentials: {
                email: envs.ADMIN_EMAIL,
                password: envs.ADMIN_PASS
            },
            // Update the role field of the document
            role: UserRoles.ADMIN
        },
        // Specify the "upsert" option to create a new document if it doesn't exist
        { upsert: true }
    );
});

afterEach(async () => {
    // Reset the database
    await UserModel.deleteMany({});
    await StoreModel.deleteMany({});
});
