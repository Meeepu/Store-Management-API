import { version } from '../../package.json';
import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Store Management API',
            description: 'A simple API that allows users to create and manage their own stores.',
            version
        },
        components: {
            securitySchemes: {
                accessTokenCookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'access-token'
                },
                refreshTokenCookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'refresh-token'
                }
            }
        },
        security: [
            {
                accessTokenCookieAuth: [],
                refreshTokenCookieAuth: []
            }
        ]
    },
    apis: ['./src/api/**/*.ts', './src/utilities/errors.ts']
};

export const swaggerSpec = swaggerJsDoc(options);
