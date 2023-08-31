import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import errorHandler from 'middlewares/errorHandler';
import authenticate from 'middlewares/authenticate';
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(authenticate);
app.use(errorHandler);
