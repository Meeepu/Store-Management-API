import { compareSync } from 'bcrypt';
import { cookieOptions, signAccess, signRefresh } from '../../utilities/cookies';
import { Payload, RegisterUser } from './auth.types';
import { RequestHandler, Request } from 'express';
import { Unauthorized } from '../../utilities/errors';
import UserModel, { User, UserDocument } from '../user/user.model';

const passwordFormat: RegExp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?\/~_+-=|\\]).{8,32}$/;

export const register: RequestHandler = async (req: Request<{}, {}, RegisterUser>, res) => {
    const { firstName, middleName, lastName, extensionName, email, password } = req.body;

    // Check password format
    const validPassword: boolean = typeof password === 'string' && passwordFormat.test(password);

    // Creating a new user
    await UserModel.create({
        name: {
            first: firstName,
            middle: middleName,
            last: lastName,
            extension: extensionName
        },
        credentials: {
            email,
            password: validPassword ? password : undefined
        }
    });

    // Sending a success status code back to the client
    res.sendStatus(201);
};

export const login: RequestHandler = async (req: Request<{}, {}, User['credentials']>, res) => {
    const { email, password } = req.body;

    // Find a user document in the UserModel collection that matches the provided email in the 'credentials.email' field
    const user: UserDocument | null = await UserModel.findOne({ 'credentials.email': email }).exec();

    // If no user is found or no password is provided, or the provided password does not match the user's password, throw an Unauthorized error
    if (!user || !password || compareSync(password, user.credentials.password) === false) throw new Unauthorized();

    // Create a payload object containing the user's userId and role
    const payload: Payload = {
        userId: user.userId,
        role: user.role
    };

    // Set cookies in the response with the 'access-token' and 'refresh-token' names, and sign the payload using the 'signAccess' and 'signRefresh' functions
    // The cookies are set with the options specified in 'cookieOptions.access' and 'cookieOptions.refresh'
    // Finally, send a 204 status code indicating success
    res.cookie('access-token', signAccess(payload), cookieOptions.access)
        .cookie('refresh-token', signRefresh(payload), cookieOptions.refresh)
        .sendStatus(204);
};

export const logout: RequestHandler = (_req, res) => {
    // Reset cookies by overriding exisiting cookies with an empty string and setting the maxAge to 0
    // This results in the cookies being immediately expire upon sending the request
    res.cookie('access-token', '', cookieOptions.default)
        .cookie('refresh-token', '', cookieOptions.default)
        .sendStatus(204);
};
