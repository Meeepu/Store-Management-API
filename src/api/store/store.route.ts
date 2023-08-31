import { admin, owner } from '../../middlewares/authorize';
import { createStore, deleteStore, getStores, updateStore } from './store.controller';
import { Router } from 'express';
import asyncHandler from '../../middlewares/asynchronousHandler';

const router = Router();

router.post('/', asyncHandler(createStore));

router.use(admin, owner);

router.get('/', asyncHandler(getStores));

router.patch('/', asyncHandler(updateStore));

router.delete('/', asyncHandler(deleteStore));

export default router;
