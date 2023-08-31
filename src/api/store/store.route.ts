import { admin, owner } from '../../middlewares/authorize';
import { createStore, deleteStore, getStore, getStores, updateStore } from './store.controller';
import { Router } from 'express';
import asyncHandler from '../../middlewares/asynchronousHandler';

const router = Router();

/**
 * @openapi
 * /store:
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
 *      500:
 *        description: Internal server error
 */
router.post('/', asyncHandler(createStore));

router.use(admin, owner);

/**
 * @openapi
 * /store:
 *  get:
 *    tags:
 *      - store
 *    summary: Get owned stores
 *    response:
 *      200:
 *        description: Stores
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Store'
 *      500:
 *        description: Internal server error
 */
router.get('/', asyncHandler(getStores));

/**
 * @openapi
 * /store/{storeId}:
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
 *      403:
 *        description: User is not an admin or owner of store
 *      422:
 *        description: Store ID is required
 *      500:
 *        description: Internal server error
 */
router.get('/{storeId}', asyncHandler(getStore));

/**
 * @openapi
 * /store/{storeId}:
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
 *      422:
 *        description: Store ID is required
 *      500:
 *        description: Internal server error
 */
router.patch('/{storeId}', asyncHandler(updateStore));

/**
 * @openapi
 * /store/{storeId}:
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
 *      403:
 *        description: User is not an admin or owner of store
 *      422:
 *        description: Store ID is required
 *      500:
 *        description: Internal server error
 */
router.delete('/{storeId}', asyncHandler(deleteStore));

export default router;
