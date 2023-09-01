import { hashSync } from 'bcrypt';
import { Document, model, Schema } from 'mongoose';
import generateId from '../../utilities/idGenerator';

const userSchema = new Schema(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            unique: true,
            default: generateId
        },
        name: {
            first: {
                type: String,
                required: [true, 'First name is required']
            },
            middle: String,
            last: {
                type: String,
                required: [true, 'Last name is required']
            },
            extension: String
        },
        credentials: {
            email: {
                type: String,
                required: [true, 'Email is required'],
                match: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
                unique: true
            },
            password: {
                type: String,
                required: [true, 'Password is required'],
                set: (value: string): string => hashSync(value, 10)
            }
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'user'],
                message: '"{VALUE}" is not a valid role'
            },
            default: 'user'
        }
    },
    { timestamps: true }
);

export enum UserRoles {
    ADMIN = 'admin',
    USER = 'user'
}

/**
 * @openapi
 * components:
 *  schemas:
 *    UserCredentials:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *        password:
 *          type: string
 *
 *    User:
 *      type: object
 *      properties:
 *        userId:
 *          type: string
 *        name:
 *          type: object
 *          properties:
 *            first:
 *              type: string
 *            middle:
 *              type: string
 *            last:
 *              type: string
 *            extension:
 *              type: string
 *        role:
 *          type: string
 *          default: user
 *          enum:
 *            - admin
 *            - user
 */
export interface User {
    userId: string;
    name: {
        first: string;
        middle?: string;
        last: string;
        extension?: string;
    };
    credentials: {
        email: string;
        password: string;
    };
    role: UserRoles;
}

export interface UserDocument extends User, Document {
    createdAt: Date;
    updatedAt: Date;
}

export default model<UserDocument>('User', userSchema);
