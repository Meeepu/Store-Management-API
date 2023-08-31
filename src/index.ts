import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authenticate';

import authRoute from './api/auth/auth.route';
import storeRoute from './api/store/store.route';
import userRoute from './api/user/user.route';

import { NotFound } from './utilities/errors';
import { swaggerSpec } from './utilities/swagger';
import envs from './utilities/envs';

const app = express();

app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoute);
app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});
app.use(authenticate);
app.use('/stores', storeRoute);
app.use('/users', userRoute);

app.use((_req, _res, next) => next(new NotFound()));
app.use(errorHandler);

mongoose.connect(envs.MONGO_URI).then(() => {
    console.log('Connected to database');
    app.listen(envs.PORT, () => console.log(`Server is running on port ${envs.PORT}`));
});

export default app;
