import { Router } from 'express';
import { login, register } from './auth.controller';
import asyncHandler from '../../middlewares/asynchronousHandler';

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

export default router;
