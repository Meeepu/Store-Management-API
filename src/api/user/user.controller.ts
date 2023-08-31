import { RequestHandler, Request } from 'express';
import { Unauthorized } from '../../utilities/errors';
import { UserDetails } from './user.types';
import UserModel, { User } from './user.model';

export const updateDetails: RequestHandler = async (req: Request<{}, {}, Partial<UserDetails>>, res) => {
    if (!req.user) throw new Unauthorized();

    const { firstName, middleName, lastName, extensionName } = req.body;

    const details: User = { name: {} } as User;
    if (firstName) details.name.first = firstName;
    if (middleName) details.name.middle = middleName;
    if (lastName) details.name.last = lastName;
    if (extensionName) details.name.extension = extensionName;

    await UserModel.updateOne({ userId: req.user.userId }, { $set: details });

    res.sendStatus(204);
};

export const updateCredentials: RequestHandler = async (req: Request<{}, {}, User['credentials']>, res) => {
    if (!req.user) throw new Unauthorized();

    const { email, password } = req.body;

    await UserModel.updateOne({ userId: req.user.userId }, { $set: { credentials: { email, password } } });

    res.sendStatus(204);
};
