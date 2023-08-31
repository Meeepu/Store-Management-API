import asyncHandler from '../../middlewares/asynchronousHandler';
import { updateCredentials, updateDetails } from './user.controller';

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

/**
 * @openapi
 * /user/credentials:
 *  patch:
 *    tags:
 *      - user
 *    summary: Update user credentials
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserCredentials'
 *    responses:
 *      204:
 *        description: User credentials updated
 *      401:
 *        description: User is not logged in
 *      409:
 *        description: Email already saved
 *      500:
 *        description: Internal server error
 */
router.patch('/credentials', asyncHandler(updateCredentials));

export default router;
