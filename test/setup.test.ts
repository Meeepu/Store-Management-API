import UserModel, { UserRoles } from '../src/api/user/user.model';
import StoreModel from '../src/api/store/store.model';
import envs from '../src/utilities/envs';
import genStores from './generators/stores';

beforeEach(async () => {
    // Reset the database
    await UserModel.deleteMany({});
    await StoreModel.deleteMany({});

});

afterEach(async () => {
    // Reset the database
    await UserModel.deleteMany({});
    await StoreModel.deleteMany({});
});
