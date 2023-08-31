import { createStore, deleteStore, getStore, getStores, updateStore } from './store.controller';
import { Router } from 'express';
import asyncHandler from '../../middlewares/asynchronousHandler';

const router = Router();

/**
 * @openapi
 * /stores:
 *  post:
 *    tags:
 *      - store
 *    summary: Create a new store
 *    requestBody:
 *      requried: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateStore'
 *    responses:
 *      201:
 *        description: Store created
 *      401:
 *        description: User is not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      422:
 *        description: Incomplete store details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ValidationError'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 */
router.post('/', asyncHandler(createStore));

/**
 * @openapi
 * /stores:
 *  get:
 *    tags:
 *      - store
 *    summary: Get owned stores
 *    responses:
 *      200:
 *        description: Stores
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Store'
 *      401:
 *        description: User is not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 */
router.get('/', asyncHandler(getStores));

/**
 * @openapi
 * /stores/{storeId}:
 *  get:
 *    tags:
 *      - store
 *    summary: Get owned store by storeId
 *    parameters:
 *      - name: storeId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Found store by storeId
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Store'
 *      401:
 *        description: User is not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      403:
 *        description: User is not an admin or owner of store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      422:
 *        description: Store ID is required
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ValidationError'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 */
router.get('/:storeId', asyncHandler(getStore));

/**
 * @openapi
 * /stores/{storeId}:
 *  patch:
 *    tags:
 *      - store
 *    summary: Update store details
 *    parameters:
 *      - name: storeId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: Store details updated
 *      403:
 *        description: User is not an admin or owner of store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      404:
 *        description: Store not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      422:
 *        description: Store ID is required
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ValidationError'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 */
router.patch('/:storeId', asyncHandler(updateStore));

/**
 * @openapi
 * /stores/{storeId}:
 *  delete:
 *    tags:
 *      - store
 *    summary: Delete a store by storeId
 *    parameters:
 *      - name: storeId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      204:
 *        description: Store deleted
 *      401:
 *        description: User is not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      403:
 *        description: User is not an admin or owner of store
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      404:
 *        description: Store not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 *      422:
 *        description: Store ID is required
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ValidationError'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/responses/ErrorResponse'
 */
router.delete('/:storeId', asyncHandler(deleteStore));

export default router;
