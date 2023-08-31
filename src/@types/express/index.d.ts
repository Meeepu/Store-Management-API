import { StoreDocument } from '../../api/store/store.model';
import { UserDocument } from '../../api/user/user.model';
import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
            store?: StoreDocument;
        }
    }
}
