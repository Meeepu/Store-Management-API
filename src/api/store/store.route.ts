import { Router } from 'express';
import asyncHandler from 'middlewares/asynchronousHandler';
import { createStore, deleteStore, getStores, updateStore } from './store.controller';

const router = Router();

router.get('/', asyncHandler(getStores));

router.post('/', asyncHandler(createStore));

router.patch('/', asyncHandler(updateStore));

router.delete('/', asyncHandler(deleteStore));

export default router;
