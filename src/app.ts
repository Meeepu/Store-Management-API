import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authenticate';

import authRoute from './api/auth/auth.route';
import storeRoute from './api/store/store.route';
import userRoute from './api/user/user.route';

import { NotFound } from './utilities/errors';
import { swaggerSpec } from './utilities/swagger';

const app = express();

app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    console.log(req.body);
    console.log(req.cookies);
    next();
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoute);
app.use(authenticate);
app.use('/stores', storeRoute);
app.use('/users', userRoute);

app.use((_req, _res, next) => next(new NotFound()));
app.use(errorHandler);

export default app;