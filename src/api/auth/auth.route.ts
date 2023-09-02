import { Router } from 'express';
import { login, logout, register } from './auth.controller';
import asyncHandler from '../../middlewares/asynchronousHandler';
import authenticate from '../../middlewares/authenticate';

const router = Router();

router.post('/login', asyncHandler(login));

router.post('/register', asyncHandler(register));

router.use(authenticate);

router.post('/logout', asyncHandler(logout));

export default router;
