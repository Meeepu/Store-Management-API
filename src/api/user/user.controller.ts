import { RequestHandler, Request } from 'express';
import { NotFound, Unauthorized } from '../../utilities/errors';
import { UserDetails, UserQuery } from './user.types';
import UserModel, { User, UserDocument } from './user.model';

export const updateDetails: RequestHandler = async (req: Request<{}, {}, Partial<UserDetails>>, res) => {
    if (!req.user) throw new Unauthorized();

    const { firstName, middleName, lastName, extensionName } = req.body;

    if (firstName) req.user.name.first = firstName;
    if (middleName) req.user.name.middle = middleName;
    if (lastName) req.user.name.last = lastName;
    if (extensionName) req.user.name.extension = extensionName;

    await req.user.save();

    res.sendStatus(204);
};

export const getUser: RequestHandler = async (req, res) => {
    const { userId } = req.params as UserQuery;

    const user: User | null = await UserModel.findOne({ userId }, { credentials: 0 });
    if (user === null) throw new NotFound('User not found');

    res.json(user);
};

export const getUsers: RequestHandler = async (_req, res) => {
    const users: UserDocument[] = await UserModel.find({}, { credentials: 0 }).lean().exec();

    res.json(users);
};
