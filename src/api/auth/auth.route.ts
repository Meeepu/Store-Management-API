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
 *    security: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserCredentials'
 *    responses:
 *      204:
 *        description:
 *          Successfully authenticated.
 *          The access and refresh tokens are returned in a cookie named `access-token` and `refresh-token` respectively.
 *          You need to include these cookies in subsequent requests.
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
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
 *    security: []
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
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 *      422:
 *        $ref: '#/components/responses/ValidationError'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
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
 *      401:
 *        description: User is not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', asyncHandler(logout));

export default router;
