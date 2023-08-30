import { User, UserRoles } from '../user/user.model';

export type RegisterUser = {
    firstName: string;
    middleName?: string;
    lastName: string;
    extensionName?: string;
    email: string;
    password: string;
};

export type Payload = {
    userId: User['userId'];
    role: UserRoles;
};
