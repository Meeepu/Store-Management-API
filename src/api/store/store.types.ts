export type StoreQuery = {
    storeId: string;
};

/**
 * @openapi
 * components:
 *   schemas:
 *      CreateStore:
 *        type: object
 *        required:
 *          - name
 *          - addressLine
 *          - city
 *          - province
 *          - region
 *        properties:
 *          name:
 *            type: string
 *            example: John's Store
 *          addressLine:
 *            type: string
 *            example: 123 Main St
 *          city:
 *            type: string
 *            example: Marikina City
 *          province:
 *            type: string
 *            example: NCR
 *          region:
 *            type: string
 *            example: NCR
 */
export type StoreCreate = {
    name: string;
    addressLine: string;
    city: string;
    province: string;
    region: string;
}