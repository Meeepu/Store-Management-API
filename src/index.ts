import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import errorHandler from 'middlewares/errorHandler';
import authenticate from 'middlewares/authenticate';

import authRoute from './api/auth/auth.route';
import storeRoute from './api/store/store.route';
import userRoute from './api/user/user.route';

import { NotFound } from 'utilities/errors';
import envs from 'utilities/envs';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(helmet());

app.use('/auth', authRoute);
app.use(authenticate);
app.use('/store', storeRoute);
app.use('/user', userRoute);

app.use((_req, _res, next) => next(new NotFound()));
app.use(errorHandler);

mongoose.connect(envs.MONGO_URI).then(() => {
    console.log('Connected to database');
    app.listen(envs.PORT, () => console.log(`Server is running on port ${envs.PORT}`));
});

export default app;
