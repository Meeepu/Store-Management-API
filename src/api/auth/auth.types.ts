import { User, UserRoles } from '../user/user.model';

/**
 * @openapi
 * components:
 *  schemas:
 *    RegisterUser:
 *      type: object
 *      required:
 *        - firstName
 *        - lastName
 *        - email
 *        - password
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
 *        email:
 *          type: string
 *          format: email
 *          example: john.doe@example.com
 *        password:
 *          type: string
 *          example: john.doe's_password
 */
export type RegisterUser = {
    firstName: string;
    middleName?: string;
    lastName: string;
    extensionName?: string;
    email: string;
    password: string;
};

export type Payload = {
    userId: User['userId'];
    role: UserRoles;
};
