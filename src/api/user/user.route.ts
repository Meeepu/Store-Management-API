import asyncHandler from '../../middlewares/asynchronousHandler';
import { onlyAdmin } from '../../middlewares/authorize';
import { getUser, getUsers, updateDetails } from './user.controller';

const { Router } = require('express');

const router = Router();

router.get('/', asyncHandler(getUsers));

router.patch('/', asyncHandler(updateDetails));

router.get('/:userId', onlyAdmin, asyncHandler(getUser));

export default router;
