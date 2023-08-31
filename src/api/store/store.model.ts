import { Document, model, Schema, Types } from 'mongoose';
import { UserDocument } from '../user/user.model';
import generateId from '../../utilities/idGenerator';

const storeSchema = new Schema(
    {
        storeId: {
            type: String,
            required: [true, 'Store ID is required'],
            unique: true,
            default: generateId
        },
        owner: {
            type: Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner is required']
        },
        name: {
            type: String,
            required: [true, 'Name is required']
        },
        location: {
            addressLine: {
                type: String,
                required: [true, 'Address line is required']
            },
            city: {
                type: String,
                required: [true, 'City is required']
            },
            province: {
                type: String,
                required: [true, 'Province is required']
            },
            region: {
                type: String,
                required: [true, 'Region is required']
            }
        }
    },
    { timestamps: true }
);

/**
 * @openapi
 * components:
 *  schemas:
 *    Store:
 *      type: object
 *      required:
 *        - storeId
 *        - owner
 *        - name
 *        - location
 *      properties:
 *        storeId:
 *          type: string
 *          example: STORE0001
 *        owner:
 *          type: string
 *          example: John Doe
 *        name:
 *          type: string
 *          example: John's Store
 *        location:
 *          type: object
 *          properties:
 *            addressLine:
 *              type: string
 *              example: 123 Main St
 *            city:
 *              type: string
 *              example: Marikina City
 *            province:
 *              type: string
 *              example: NCR
 *            region:
 *              type: string
 *              example: NCR
 */
export interface Store {
    storeId: string;
    owner: Types.ObjectId | Record<string, unknown>;
    name: string;
    location: {
        addressLine: string;
        city: string;
        province: string;
        region: string;
    };
}

export interface StoreDocument extends Store, Document {
    owner: UserDocument['_id'];
    createdAt: Date;
    updatedAt: Date;
}

export interface StorePopulatedDocument extends StoreDocument {
    owner: UserDocument;
}

export default model<StoreDocument>('Store', storeSchema);
