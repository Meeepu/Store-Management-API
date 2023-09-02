import { createStore, deleteStore, getStore, getStores, updateStore } from './store.controller';
import { Router } from 'express';
import asyncHandler from '../../middlewares/asynchronousHandler';

const router = Router();

router.post('/', asyncHandler(createStore));

router.get('/', asyncHandler(getStores));

router.get('/:storeId', asyncHandler(getStore));

router.patch('/:storeId', asyncHandler(updateStore));

router.delete('/:storeId', asyncHandler(deleteStore));

export default router;
