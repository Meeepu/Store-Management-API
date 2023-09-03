import UserModel, { User } from '../../src/api/user/user.model';

export type TestUser = Omit<User, 'userId' | 'role'> & { objectId?: string, userId?: string };

export default async () => {
    const names: string[] = ['Morris Konopelski', 'Amos Emmerich', 'Kirk Hickle'];

    // Create an array to store the TestUser objects
    const users: TestUser[] = await Promise.all(
        // Use the map function to iterate over each name in the names array
        names.map(async (name, i): Promise<TestUser> => {
            // Split the name into first and last name using a space as the separator
            const [first, last] = name.split(' ');

            // Create a TestUser object with the name and credentials properties
            const user: TestUser = {
                name: { first, last },
                credentials: {
                    // Generate an email by combining the last name, a dot, the first name, and the domain
                    email: `${last}.${first}@test.com`,
                    // Generate a password by combining the last name, "H+", the current index, "+H", and the first name
                    password: `${last}H+${i}+H${first}`
                }
            };

            // Create a user document in the UserModel collection and store the result in userDocument
            const userDocument = await UserModel.create(user);

            // Assign the generated _id from the userDocument to the objectId property of the user object
            user.objectId = userDocument._id;

            // Assign the generated userId from the userDocument to the userId property of the user object
            user.userId = userDocument.userId;

            // Return the created TestUser object
            return user;
        })
    );

    return users;
};
