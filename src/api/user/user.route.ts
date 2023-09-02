import asyncHandler from '../../middlewares/asynchronousHandler';
import { onlyAdmin } from '../../middlewares/authorize';
import { getUser, getUsers, updateDetails } from './user.controller';

const { Router } = require('express');

const router = Router();

router.get('/', asyncHandler(getUsers));

router.patch('/', asyncHandler(updateDetails));

router.use(onlyAdmin);

router.get('/:userId', asyncHandler(getUser));

router.patch('/:userId', asyncHandler(updateDetails));

export default router;
