import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(helmet());
