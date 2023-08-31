import { Router } from 'express';
import { login, logout, register } from './auth.controller';
import asyncHandler from '../../middlewares/asynchronousHandler';
import authenticate from '../../middlewares/authenticate';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *  post:
 *    tags:
 *      - auth
 *    summary: Login a user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserCredentials'
 *    responses:
 *      204:
 *        description: User logged in succesfully
 *      500:
 *        description: Internal server error
 *
 */
router.post('/login', asyncHandler(login));

/**
 * @openapi
 * /auth/register:
 *  post:
 *    tags:
 *      - auth
 *    summary: Register a user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RegisterUser'
 *    responses:
 *      201:
 *        description: User registered successfully
 *      409:
 *        description: Email already registered
 *      500:
 *        description: Internal server error
 */
router.post('/register', asyncHandler(register));

router.use(authenticate);

/**
 * @openapi
 * /auth/logout:
 *  post:
 *    tags:
 *      - auth
 *    summary: Logout a user
 *    responses:
 *      204:
 *        description: User logged out succesfully
 *      500:
 *        description: Internal server error
 */
router.post('/logout', asyncHandler(logout));

export default router;
