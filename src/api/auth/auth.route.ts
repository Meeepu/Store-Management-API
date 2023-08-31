import { Router } from 'express';
import { login, register } from './auth.controller';
import asyncHandler from '../../middlewares/asynchronousHandler';

const router = Router();

router.post('/login', asyncHandler(login));

router.post('/register', asyncHandler(register));

export default router;
