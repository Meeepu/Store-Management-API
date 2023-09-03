import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import envs from './utilities/envs';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';

// Import custom middlewares and routes
import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authenticate';
import authRoute from './api/auth/auth.route';
import storeRoute from './api/store/store.route';
import userRoute from './api/user/user.route';

// Import custom utilities and models
import { NotFound } from './utilities/errors';
import UserModel, { UserDocument, UserRoles } from './api/user/user.model';

// Create Express application
const app = express();

// Use middlewares
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());

// If the environment is development, log requests to the console
if (envs.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Load Swagger documentation
const swaggerDoc = yaml.load('./swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Allow cross-origin requests
app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

// Mount routes
app.use('/auth', authRoute);
app.use('/stores', authenticate, storeRoute);
app.use('/users', authenticate, userRoute);

// Handle not found routes
app.use((_req, _res, next) => next(new NotFound()));

// Handle errors
app.use(errorHandler);

// Connect to the database
mongoose
    .connect(envs.MONGO_URI)
    .then(() => {
        if (envs.NODE_ENV !== 'test') {
            console.log('Connected to database');
        }

        // Find or create an admin user
        return UserModel.findOne({ role: UserRoles.ADMIN });
    })
    .then((admin: UserDocument | null) => {
        if (admin === null) {
            // Create a new admin user if not found
            return UserModel.create({
                name: {
                    first: 'Admin',
                    last: 'User'
                },
                credentials: {
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                },
                role: UserRoles.ADMIN
            });
        }

        return admin;
    })
    .then(() => {
        // Start the server
        app.listen(envs.PORT, () => {
            if (envs.NODE_ENV !== 'test') {
                console.log(`Server is running on port ${envs.PORT}`);
            }
        });
    })
    .catch((error) => console.log('Error connecting to database: ', error));

export default app;
