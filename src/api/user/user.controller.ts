import { RequestHandler, Request } from 'express';
import { NotFound, Unauthorized, UnprocessableEntity } from '../../utilities/errors';
import { UserDetails, UserQuery } from './user.types';
import UserModel, { User, UserDocument, UserRoles } from './user.model';

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
export const updateDetails: RequestHandler = async (req: Request<{}, {}, Partial<UserDetails>>, res) => {
    // Check if user is logged in
    if (req.user === undefined) throw new Unauthorized('User not logged in');

    // Initialize 'user' variable with the current user
    let user: UserDocument | null = req.user;

    // Check if logged-in user is an admin
    if (req.user.role === UserRoles.ADMIN) {
        // Extract 'userId' from request parameters
        const { userId } = req.params as UserQuery;

        // Check if 'userId' is a string
        if (typeof userId !== 'string') throw new UnprocessableEntity('User ID is required');

        // Find user with the provided 'userId'
        user = await UserModel.findOne({ userId });
    }

    // Check if user was found
    if (user === null) throw new NotFound('User not found');

    // Extract data from request body
    const { firstName, middleName, lastName, extensionName } = req.body;

    // Update user's name properties if provided
    if (firstName) user.name.first = firstName;
    if (middleName) user.name.middle = middleName;
    if (lastName) user.name.last = lastName;
    if (extensionName) user.name.extension = extensionName;

    // Save the updated user
    await user.save();

    // Send success status code
    res.sendStatus(204);
};
