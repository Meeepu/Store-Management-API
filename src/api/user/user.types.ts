/**
 * @openapi
 * components:
 *  schemas:
 *    UserDetails:
 *      type: object
 *      required:
 *        - firstName
 *        - lastName
 *      properties:
 *        firstName:
 *          type: string
 *          example: John
 *        middleName:
 *          type: string
 *        lastName:
 *          type: string
 *          example: Doe
 *        extensionName:
 *          type: string
 *          example: Jr.
 */
export type UserDetails = {
    firstName: string,
    middleName?: string,
    lastName: string,
    extensionName?: string
}

export type UserQuery = {
    userId: string;
}