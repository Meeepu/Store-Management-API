import { RequestHandler, Request } from 'express';
import { NotFound, Unauthorized } from '../../utilities/errors';
import { UserDetails, UserQuery } from './user.types';
import UserModel, { User, UserRoles } from './user.model';

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

export const getUsers: RequestHandler = async (req, res) => {
    // Check if the user's role is "USER"
    if (req.user?.role === UserRoles.USER) {
        // If the user's role is "USER", send the user object as the response
        return res.json(req.user);
    }

    // Find all users in the UserModel collection, excluding the "credentials" field
    const users = await UserModel.find({ role: UserRoles.USER }, { credentials: 0 }).lean().exec();

    // Send the list of users as the response
    return res.json(users);
};

export const updateDetails: RequestHandler = async (req: Request<{}, {}, Partial<UserDetails>>, res) => {
    // Check if user is logged in
    if (req.user === undefined) throw new Unauthorized('User not logged in');

    // Extract data from request body
    const { firstName, middleName, lastName, extensionName } = req.body;

    // Update user's name properties if provided
    if (firstName) req.user.name.first = firstName;
    if (middleName) req.user.name.middle = middleName;
    if (lastName) req.user.name.last = lastName;
    if (extensionName) req.user.name.extension = extensionName;

    // Save the updated user
    await req.user.save();

    // Send success status code
    res.sendStatus(204);
};
