import asyncHandler from 'middlewares/asynchronousHandler';
import { updateCredentials, updateDetails } from './user.controller';

const { Router } = require('express');

const router = Router();

router.patch('/details', asyncHandler(updateDetails));

router.patch('/credentials', asyncHandler(updateCredentials));

export default router;
