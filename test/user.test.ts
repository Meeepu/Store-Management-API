import { StoreCreate } from '../src/api/store/store.types';
import app from '../src/index';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import envs from '../src/utilities/envs';
import genStores, { TestStore } from './generators/stores';
import genUsers from './generators/users';
import { UserDetails } from '../src/api/user/user.types';

chai.use(chaiHttp);

describe('USER', () => {
    describe('Authentication', () => {
        describe('POST /auth/login', () => {
            it('should not log in with incorrect credentials', (done) => {
                chai.request(app)
                    .post('/auth/login')
                    .send({
                        email: 'admin',
                        password: 'admin'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should logged in with correct credentials', (done) => {
                chai.request(app)
                    .post('/auth/login')
                    .send({
                        email: envs.ADMIN_EMAIL,
                        password: envs.ADMIN_PASS
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(204);
                        done();
                    });
            });
        });

        describe('POST /auth/register', () => {
            it('should not register with incomplete user details', (done) => {
                chai.request(app)
                    .post('/auth/register')
                    .send({
                        firstName: 'Test',
                        middleName: 'One',
                        extensionName: 'EX',
                        password: 'Testing.123'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(422);
                        expect(res.body).to.have.property('message').to.be.an('array').with.lengthOf(2);

                        // Assert that there is at least one item in the 'message' array where 'path' is equal to 'name.last'
                        expect(res.body.message.some(({ path }) => path === 'name.last')).to.be.true;

                        // Assert that there is at least one item in the 'message' array where 'path' is equal to 'credentials.email'
                        expect(res.body.message.some(({ path }) => path === 'credentials.email')).to.be.true;
                        done();
                    });
            });

            it('should not register with incorrect password format', (done) => {
                chai.request(app)
                    .post('/auth/register')
                    .send({
                        firstName: 'Test',
                        middleName: 'One',
                        lastName: 'User',
                        extensionName: 'EX',
                        email: 'test.user@email.com',
                        password: 'test'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(422);
                        done();
                    });
            });

            it('should not register with duplicate email', async () => {
                // Create users
                const users = await genUsers();

                // Get random user
                const user = users[Math.floor(Math.random() * users.length)];

                const registerResponse = await chai.request(app).post('/auth/register').send({
                    firstName: user.name.first,
                    middleName: user.name.middle,
                    lastName: user.name.last,
                    extensionName: user.name.extension,
                    email: user.credentials.email,
                    password: user.credentials.password
                });

                expect(registerResponse).to.have.status(409);
            });

            it('should register a user with complete and correct user details', (done) => {
                chai.request(app)
                    .post('/auth/register')
                    .send({
                        firstName: 'Test',
                        middleName: 'One',
                        lastName: 'User',
                        extensionName: 'EX',
                        email: 'test.user@email.com',
                        password: 'Testing+123'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(201);
                        done();
                    });
            });

            it('should register a user if optional user details are not provided', (done) => {
                chai.request(app)
                    .post('/auth/register')
                    .send({
                        firstName: 'Test',
                        lastName: 'User',
                        email: 'test.user@email.com',
                        password: 'Testing+123'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(201);
                        done();
                    });
            });
        });

        describe('POST /auth/logout', () => {
            it('should not logged out if not logged in', (done) => {
                chai.request(app)
                    .post('/auth/logout')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should log out if logged in', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a POST request to the '/auth/logout' endpoint
                const logoutResponse = await chai
                    .request(app)
                    .post('/auth/logout')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie']);

                expect(logoutResponse).to.have.status(205);
            });
        });
    });

    describe('Store Management', () => {
        describe('GET /stores', () => {
            it('should not get any stores if not logged in', (done) => {
                chai.request(app)
                    .get('/stores')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should get an empty array of stores if there are no saved stores', async () => {
                // Generate a list of users using the genUsers() function
                const users = await genUsers();

                // Iterate over each user in the 'users' list
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a GET request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .get('/stores')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the response status code is 200
                    expect(storesResponse).to.have.status(200);
                    // Assert that the response body is an empty array
                    expect(storesResponse.body).to.be.an('array').that.is.empty;
                }
            });

            it('should get an array of stores if there are saved stores', async () => {
                // Generate an array of users
                const users = await genUsers();

                // Generate stores based on the generated users
                await genStores(users);

                // Iterate through each user in the users array
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a GET request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .get('/stores')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the response status code is 200
                    expect(storesResponse).to.have.status(200);

                    // Assert that the response body is an array
                    expect(storesResponse.body).to.be.an('array').that.is.not.empty;
                }
            });
        });

        // Function to generate incomplete store details based on a name
        function genIncompleteStoreDetails(name: string, update: string = '') {
            // Create a store object with some properties
            const store: StoreCreate = {
                name: `${name}'s Test${update}`,
                addressLine: 'Test Address Line' + update,
                city: 'Test City' + update,
                province: 'Test Province' + update,
                region: 'Test Region' + update
            };

            // Randomly remove one property from the store object
            const index = Math.floor(Math.random() * 5);
            const entries = Object.entries(store);
            entries.splice(index, 1);

            // Return the modified store object
            return Object.fromEntries(entries);
        }

        describe('POST /stores', async () => {
            it('should not create a store if not logged in', (done) => {
                chai.request(app)
                    .post('/stores')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not create a store if store details are incomplete', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Loop through each user in the list
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a POST request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .post('/stores')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie'])
                        // Send incomplete store details generated based on the user's name
                        .send(genIncompleteStoreDetails(user.name.first + ' ' + user.name.last));

                    // Assert that the response has a status code of 422 (unprocessable entity)
                    expect(storesResponse).to.have.status(422);
                }
            });

            it('should create a store with complete store details', async () => {
                // Fetch all the users
                const users = await genUsers();

                // Iterate through each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a POST request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .post('/stores')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie'])
                        .send({
                            name: `${user.name.first} ${user.name.last}'s Test Store`,
                            addressLine: 'Test Address Line',
                            city: 'Test City',
                            province: 'Test Province',
                            region: 'Test Region'
                        });

                    // Assert that the response from the '/stores' endpoint has a status code of 201 (Created)
                    expect(storesResponse).to.have.status(201);
                }
            });
        });

        describe('GET /stores/{storeId}', async () => {
            it('should not get a store if not logged in', (done) => {
                chai.request(app)
                    .get('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not get a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                const stores = await genStores(users);

                // Iterate through each user in the users array
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a GET request to the '/stores/{storeId}' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .get('/stores/1')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the 'storesResponse' has a status code of 404
                    expect(storesResponse).to.have.status(404);
                }
            });

            it('should not get a store if it is not the owner', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (let j = 0; j < stores.length; j++) {
                        const store = stores[j];

                        // Skip the current store if it belongs to the current user
                        if (store.owner.userId === user.userId) continue;

                        // Send a GET request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .get(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the response status is 403 (Forbidden)
                        expect(storesResponse).to.have.status(403);
                    }
                }
            });

            it('should get a store the user owns', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores using the generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (let j = 0; j < stores.length; j++) {
                        const store = stores[j];

                        // Skip the store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a GET request to retrieve the store information
                        const storesResponse = await chai
                            .request(app)
                            .get(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the response has a status code of 200
                        expect(storesResponse).to.have.status(200);
                    }
                }
            });
        });

        describe('PATCH /stores/{storeId}', () => {
            it('should not update a store if not logged in', (done) => {
                chai.request(app)
                    .get('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not update a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                const stores = await genStores(users);

                // Iterate through each user in the users array
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a PATCH request to the '/stores/{storeId}' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .patch('/stores/1')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the 'storesResponse' has a status code of 404
                    expect(storesResponse).to.have.status(404);
                }
            });

            it('should not update a store if it is not the owner', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (let j = 0; j < stores.length; j++) {
                        const store = stores[j];

                        // Skip the current store if it belongs to the current user
                        if (store.owner.userId === user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the response status is 403 (Forbidden)
                        expect(storesResponse).to.have.status(403);
                    }
                }
            });

            it('should update a store with complete details', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (let j = 0; j < stores.length; j++) {
                        const store = stores[j];

                        // Skip the current store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie'])
                            .send({
                                name: `${user.name.first} ${user.name.last}'s Test Store Update`,
                                addressLine: 'Test Address Line Update',
                                city: 'Test City Update',
                                province: 'Test Province Update',
                                region: 'Test Regio Updaten'
                            });

                        // Assert that the response has a status code of 204
                        expect(storesResponse).to.have.status(204);
                    }
                }
            });

            it('should update a store with incomplete details', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (let j = 0; j < stores.length; j++) {
                        const store = stores[j];

                        // Skip the current store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie'])
                            .send(genIncompleteStoreDetails(user.name.first + ' ' + user.name.last, ' Update'));

                        // Assert that the response has a status code of 204
                        expect(storesResponse).to.have.status(204);
                    }
                }
            });
        });

        describe('DELETE /stores/{storeId}', () => {
            it('should not delete a store if not logged in', (done) => {
                chai.request(app)
                    .get('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not delete a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                const stores = await genStores(users);

                // Iterate through each user in the users array
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a DELETE request to the '/stores/{storeId}' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .delete('/stores/1')
                        // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the 'storesResponse' has a status code of 404
                    expect(storesResponse).to.have.status(404);
                }
            });

            it('should not delete a store if it is not the owner', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Filter stores not owned by user
                    const filteredStores = stores.filter((store) => store.owner.userId !== user.userId);

                    // Iterate over each filtered stores
                    for (let j = 0; j < filteredStores.length; j++) {
                        const store = filteredStores[j];

                        // Send a DELETE request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .delete(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the 'storesResponse' has a status code of 403
                        expect(storesResponse).to.have.status(403);
                    }
                }
            });

            it('should delete a store owned by user', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Filter owned stores by user
                    const filteredStores = stores.filter((store) => store.owner.userId === user.userId);

                    // Iterate over each filtered stores
                    for (let j = 0; j < filteredStores.length; j++) {
                        const store = filteredStores[j];

                        // Send a DELETE request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .delete(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the 'storesResponse' has a status code of 204
                        expect(storesResponse).to.have.status(204);
                    }

                    // Send a GET request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .get('/stores')
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Assert that the 'storesResponse' has a status code of 200
                    expect(storesResponse).to.have.status(200);

                    // Assert that there are no stores in the response
                    expect(storesResponse.body).to.be.empty;
                }
            });
        });
    });

    describe('User Management', () => {
        describe('GET /users', () => {
            it('should not return a user if not logged in', (done) => {
                chai.request(app)
                    .get('/users')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should return a user', async () => {
                // Fetch the users data asynchronously
                const users = await genUsers();

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a GET request to the '/users' endpoint
                    // Set the 'Cookie' header with the value from the login response
                    const usersResponse = await chai
                        .request(app)
                        .get('/users')
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Perform assertions on the response
                    expect(usersResponse).to.have.status(200);
                    expect(usersResponse.body).to.have.property('userId').equals(user.userId);
                }
            });
        });

        describe('PATCH /users', () => {
            it('should not update a user if not logged in', (done) => {
                chai.request(app)
                    .get('/users')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should update a user', async () => {
                const users = await genUsers();

                // Iterate over each user
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Send a POST request to the '/auth/login' endpoint to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    const details: UserDetails = {
                        firstName: `${user.name.first} Updated`,
                        lastName: `${user.name.last} Updated`
                    };

                    if (user.name.middle) details.middleName = user.name.middle;
                    if (user.name.extension) details.extensionName = user.name.extension;

                    // Send a PATCH request to the '/users' endpoint
                    const usersResponse = await chai
                        .request(app)
                        .patch('/users')
                        // Set the 'Cookie' header with the value from the login response
                        .set('Cookie', loginResponse.headers['set-cookie'])
                        .send(details);

                    // Perform assertions on the response
                    expect(usersResponse).to.have.status(204);
                }
            });
        });
    });
});
