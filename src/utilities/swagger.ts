import { version } from '../../package.json';
import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Store Management API',
            version
        }
    },
    apis: ['./src/api/**/*.ts']
};

export const swaggerSpec = swaggerJsDoc(options);
