import { StoreCreate } from '../../src/api/store/store.types';
import { User } from '../../src/api/user/user.model';

export default (name: string): StoreCreate => ({
    name: `${name}'s Store`,
    addressLine: 'Test Address Line',
    city: 'Test City',
    province: 'Test Province',
    region: 'Test Region'
});
