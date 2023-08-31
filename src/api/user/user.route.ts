import asyncHandler from '../../middlewares/asynchronousHandler';
import { onlyAdmin } from '../../middlewares/authorize';
import { getUser, getUsers, updateDetails } from './user.controller';

const { Router } = require('express');

const router = Router();

/**
 * @openapi
 * /user/details:
 *  patch:
 *    tags:
 *      - user
 *    summary: Update user details
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserDetails'
 *    responses:
 *      204:
 *        description: User details updated
 *      401:
 *        description: User is not logged in
 *      500:
 *        description: Internal server error
 */
router.patch('/details', asyncHandler(updateDetails));

router.use(onlyAdmin);

/**
 * @openapi
 * /user:
 *  get:
 *    tags:
 *      - user
 *    summary: Get all registered users
 *    responses:
 *      200:
 *        description: Found users
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        description: User is not logged in
 *      403:
 *        description: User is not an admin
 *      500:
 *        description: Internal server error
 */
router.get('/', asyncHandler(getUsers));

/**
 * @openapi
 * /user/{userId}:
 *  get:
 *    tags:
 *      - user
 *    summary: Get user by userId
 *    parameters:
 *      - name: userId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Found user
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *      401:
 *        description: User is not logged in
 *      403:
 *        description: User is not an admin
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal server error
 */
router.get('/:userId', asyncHandler(getUser));

export default router;
