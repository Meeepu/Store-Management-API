import { cookieOptions, signAccess, signRefresh } from '../utilities/cookies';
import { JwtPayload, verify } from 'jsonwebtoken';
import { NotFound, Unauthorized } from '../utilities/errors';
import { Payload } from '../api/auth/auth.types';
import { RequestHandler } from 'express';
import envs from '../utilities/envs';
import UserModel, { UserDocument } from '../api/user/user.model';

const refreshTime = 5 * 24 * 60 * 60 * 1000; // 5 days
const authenticate: RequestHandler = async (req, res, next) => {
    // Extract the 'access-token' and 'refresh-token' from the cookies of the request
    const { 'access-token': accessToken, 'refresh-token': refreshToken } = req.cookies;

    // If there is no refresh token, return an Unauthorized error
    if (!refreshToken) return next(new Unauthorized('This action requires logging in first'));

    let payload: Payload | undefined;

    try {
        // Verify the access token using the secret key
        payload = verify(accessToken, envs.JWT_ACCESS) as Payload;
    } catch (error) {}

    if (!payload) {
        try {
            // Verify the refresh token using the secret key and extract the userId, role, and expiration time
            const { userId, role, exp = new Date() } = verify(refreshToken, envs.JWT_REFRESH) as JwtPayload & Payload;
            payload = { userId, role };

            // Generate a new access token and set it as a cookie
            res.cookie('access-token', signAccess(payload), cookieOptions.access);

            // If the refresh token has expired, generate a new refresh token and set it as a cookie
            if (Date.now() - new Date(exp).getTime() > refreshTime)
                res.cookie('refresh-token', signRefresh(payload), cookieOptions.refresh);
        } catch (error) {
            // If there is an error while verifying the refresh token, clear the cookies and return the error
            res.cookie('access-token', '', cookieOptions.default).cookie('refresh-token', '', cookieOptions.default);
            return next(error);
        }
    }

    if (payload) {
        // If the payload exists, find the user in the database based on the userId and role
        const user: UserDocument | null = await UserModel.findOne({ userId: payload.userId, role: payload.role });

        // If the user is not found, return a NotFound error
        if (user === null) return next(new NotFound('User not found'));

        // Set the authenticated user in the request object and move to the next middleware
        req.user = user;
        return next();
    }

    // If none of the above conditions are met, return an Unauthorized error
    next(new Unauthorized('This action requires logging in first'));
};

export default authenticate;
