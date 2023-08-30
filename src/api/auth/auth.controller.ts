import { compareSync } from 'bcrypt';
import { cookieOptions, signAccess, signRefresh } from 'utilities/cookies';
import { Payload, RegisterUser } from './auth.types';
import { RequestHandler, Request } from 'express';
import { Unauthorized } from 'utilities/errors';
import UserModel, { User, UserDocument } from '../user/user.model';

export const login: RequestHandler = async (req: Request<{}, {}, RegisterUser>, res) => {
    const { firstName, middleName, lastName, extensionName, email, password } = req.body;

    await UserModel.create({
        name: {
            first: firstName,
            middle: middleName,
            last: lastName,
            extension: extensionName
        },
        credentials: {
            email,
            password
        }
    });

    res.sendStatus(201);
};

export const register: RequestHandler = async (req: Request<{}, {}, User['credentials']>, res) => {
    const { email, password } = req.body;

    const user: UserDocument | null = await UserModel.findOne({ 'credentials.email': email }).exec();
    if (!user || !password || compareSync(password, user.credentials.password) === false) throw new Unauthorized();

    const payload: Payload = {
        userId: user.userId,
        role: user.role
    };

    res.cookie('access-token', signAccess(payload), cookieOptions.access)
        .cookie('refresh-token', signRefresh(payload), cookieOptions.refresh)
        .sendStatus(200);
};
