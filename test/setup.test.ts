import UserModel from '../src/api/user/user.model';
import StoreModel from '../src/api/store/store.model';

before((done) => {
    UserModel.deleteMany({})
        .then(() => StoreModel.deleteMany({}))
        .then(() => done());
});

after((done) => {
    UserModel.deleteMany({})
        .then(() => StoreModel.deleteMany({}))
        .then(() => done());
});
