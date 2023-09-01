import UserModel, { UserDocument, UserRoles } from './api/user/user.model';
import app from './app';
import database from './database';
import envs from './utilities/envs';

// Connect to the database
database
    .then(() => {
        console.log('Connected to database');

        // Find the admin user in the database
        return UserModel.findOne({ 'credentials.email': envs.ADMIN_EMAIL });
    })
    .then((admin: UserDocument | null) => {
        // If the admin user does not exist, create it
        if (admin === null) {
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

        // Return the existing admin user
        return admin;
    })
    .then(() => {
        // Start the server and listen on the specified port
        app.listen(envs.PORT, () => console.log(`Server is running on port ${envs.PORT}`));
    });

export default app;
