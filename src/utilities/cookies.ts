import { Payload } from '../api/auth/auth.types';
import { sign } from 'jsonwebtoken';
import envs from './envs';

const duration = {
    access: 60 * 1000, // 1 minute
    refresh: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export type TCookie = {
    httpOnly: boolean;
    sameSite: 'none';
    maxAge: number;
    secure: boolean;
};

const cookie: TCookie = {
    httpOnly: true,
    sameSite: 'none',
    maxAge: 0,
    secure: true
};

export const cookieOptions: {
    access: TCookie;
    refresh: TCookie;
    default: TCookie;
} = {
    access: { ...cookie, maxAge: duration.access },
    refresh: { ...cookie, maxAge: duration.refresh },
    default: cookie
};

const signCookie = (payload: Payload, secret: string, expiresIn: number): string =>
    sign({ ...payload, createdAt: new Date() }, secret, { expiresIn });

export const signAccess = (payload: Payload): string => signCookie(payload, envs.JWT_ACCESS, duration.access);
export const signRefresh = (payload: Payload): string => signCookie(payload, envs.JWT_REFRESH, duration.refresh);
