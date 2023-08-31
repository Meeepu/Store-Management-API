import { RequestHandler, Request } from 'express';
import { NotFound, Unauthorized } from '../../utilities/errors';
import { UserDetails, UserQuery } from './user.types';
import UserModel, { User, UserDocument } from './user.model';

export const updateDetails: RequestHandler = async (req: Request<{}, {}, Partial<UserDetails>>, res) => {
    // Check if the user is logged in
    if (!req.user) throw new Unauthorized();

    const { firstName, middleName, lastName, extensionName } = req.body;

    // Update the property if the value is given
    if (firstName) req.user.name.first = firstName;
    if (middleName) req.user.name.middle = middleName;
    if (lastName) req.user.name.last = lastName;
    if (extensionName) req.user.name.extension = extensionName;

    // Save the updated user
    await req.user.save();

    res.sendStatus(204);
};

export const getUser: RequestHandler = async (req, res) => {
    const { userId } = req.params as UserQuery;

    // Find a user in the UserModel collection that matches the userId,
    // excluding the 'credentials' field from the returned document
    const user: User | null = await UserModel.findOne({ userId }, { credentials: 0 });

    // If no user is found, throw a NotFound error
    if (user === null) throw new NotFound('User not found');

    // Return the found user as a JSON response
    res.json(user);
};

export const getUsers: RequestHandler = async (_req, res) => {
    // Find all users in the UserModel collection, excluding the 'credentials' field.
    const users: UserDocument[] = await UserModel.find({}, { credentials: 0 }).lean().exec();

    // Send the users data as a JSON response.
    res.json(users);
};
