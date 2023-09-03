import app from '../src/index';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import createTestStore from './helpers/createTestStore';
import genStores from './generators/stores';
import genUsers from './generators/users';
import modifyDetails from './helpers/modifyDetails';

chai.use(chaiHttp);

describe('USER', () => {
    describe('Authentication', () => {
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
                        expect(res.body).to.have.property('name').equals('ValidationError');
                        expect(res.body).to.have.property('message').to.be.an('array').with.lengthOf(2);

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
                        expect(res.body).to.have.property('name').equals('Unprocessable Entity');

                        done();
                    });
            });

            it('should not register with duplicate email', async () => {
                // Generate a list of users using the genUsers function
                const users = await genUsers();

                // Select a random user from the users list
                const user = users[Math.floor(Math.random() * users.length)];

                // Send a POST request to the '/auth/register' endpoint of the 'app'
                const registerResponse = await chai.request(app).post('/auth/register').send({
                    firstName: user.name.first,
                    middleName: user.name.middle,
                    lastName: user.name.last,
                    extensionName: user.name.extension,
                    email: user.credentials.email,
                    password: user.credentials.password
                });

                // Assert that the response status code is 409 (Conflict)
                expect(registerResponse).to.have.status(409);
                expect(registerResponse.body).to.have.property('name').equals('DuplicateError');
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

        describe('POST /auth/login', () => {
            it('should not log in with missing credentials', async () => {
                // Call the genUsers function to generate an array of users
                const users = await genUsers();

                // Iterate through each user in the users array
                for (const user of users) {
                    // Send a POST request to the '/auth/login' endpoint of the app with only the user's email
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email
                    });

                    expect(loginResponse).to.have.status(401);
                    expect(loginResponse.body).to.have.property('name').equals('Unauthorized');
                }
            });

            it('should not log in with incorrect credentials', async () => {
                // Call the genUsers function to generate an array of users
                const users = await genUsers();

                // Iterate through each user in the users array
                for (const user of users) {
                    // Send a POST request to the '/auth/login' endpoint of the app with the user's email and a modified password
                    const loginResponse = await chai
                        .request(app)
                        .post('/auth/login')
                        .send({
                            email: user.credentials.email,
                            password: `${user.credentials.password}-test`
                        });

                    expect(loginResponse).to.have.status(401);
                    expect(loginResponse.body).to.have.property('name').equals('Unauthorized');
                }
            });

            it('should logged in with correct credentials', async () => {
                // Fetch the users data
                const users = await genUsers();

                // Loop through each user
                for (const user of users) {
                    // Send a POST request to the '/auth/login' endpoint with the user's credentials
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Assert that the login response has a status code of 204 (No Content)
                    expect(loginResponse).to.have.status(204);
                }
            });
        });

        describe('POST /auth/logout', () => {
            it('should not logged out if not logged in', async () => {
                // Fetch the list of users using the genUsers() function
                const users = await genUsers();

                // Iterate over each user in the users list
                for (const user of users) {
                    // Send a POST request to the '/auth/logout' endpoint
                    // The request body contains the user's email and password
                    const logoutResponse = await chai.request(app).post('/auth/logout').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    expect(logoutResponse).to.have.status(401);
                    expect(logoutResponse.body).to.have.property('name').equals('Unauthorized');
                }
            });

            it('should log out if logged in', async () => {
                // Fetch the list of users using the genUsers() function
                const users = await genUsers();

                // Iterate over each user in the users list
                for (const user of users) {
                    // Send a POST request to the '/auth/logout' endpoint
                    // The request body contains the user's email and password
                    const logoutResponse = await chai.request(app).post('/auth/logout').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    expect(logoutResponse).to.have.status(401);
                    expect(logoutResponse.body).to.have.property('name').equals('Unauthorized');
                }
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
                        expect(res.body).to.have.property('name').equals('Unauthorized');
                        done();
                    });
            });

            it('should get an empty array of stores if there are no saved stores', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Iterate over each user in the 'users' list
                for (const user of users) {
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

                    expect(storesResponse).to.have.status(200);
                    expect(storesResponse.body).to.be.an('array').that.is.empty;
                }
            });

            it('should get an array of stores if there are saved stores', async () => {
                // Generate an array of users
                const users = await genUsers();

                // Generate stores based on the generated users
                await genStores(users);

                // Iterate through each user in the users array
                for (const user of users) {
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

                    expect(storesResponse).to.have.status(200);
                    expect(storesResponse.body).to.be.an('array').that.is.not.empty;
                }
            });
        });

        describe('POST /stores', async () => {
            it('should not create a store if not logged in', (done) => {
                chai.request(app)
                    .post('/stores')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should not create a store if store details are incomplete', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Loop through each user in the list
                for (const user of users) {
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
                        .send(modifyDetails(createTestStore(`${user.name.first} ${user.name.last}`), '', true));

                    // Assert that the response has a status code of 422 (unprocessable entity)
                    expect(storesResponse).to.have.status(422);
                    expect(storesResponse.body).to.have.property('name').equals('ValidationError');
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
                        .send(createTestStore(`${user.name.first} ${user.name.last}`));

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
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should not get a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                await genStores(users);

                // Iterate through each user in the users array
                for (const user of users) {
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
                for (const user of users) {
                    // Send a POST request to the '/auth/login' endpoint with the user's email and password
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (const store of stores) {
                        // Skip the current store if it belongs to the current user
                        if (store.owner.userId === user.userId) continue;

                        // Send a GET request to the '/stores/{storeId}' endpoint
                        const storeResponse = await chai
                            .request(app)
                            .get(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        expect(storeResponse).to.have.status(403);
                        expect(storeResponse.body).to.have.property('name').equals('Forbidden');
                        expect(storeResponse.body)
                            .to.have.property('message')
                            .equals('You are not the owner of this store');
                    }
                }
            });

            it('should get a store the user owns', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores using the generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (const store of stores) {
                        // Skip the store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a GET request to retrieve the store information
                        const storesResponse = await chai
                            .request(app)
                            .get(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

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
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should not update a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                const stores = await genStores(users);

                // Iterate through each user in the users array
                for (const user of users) {
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
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (const store of stores) {
                        // Skip the current store if it belongs to the current user
                        if (store.owner.userId === user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storeResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the response status is 403 (Forbidden)
                        expect(storeResponse).to.have.status(403);
                        expect(storeResponse.body).to.have.property('name').equals('Forbidden');
                        expect(storeResponse.body)
                            .to.have.property('message')
                            .equals('You are not the owner of this store');
                    }
                }
            });

            it('should update a store with complete details', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (const store of stores) {
                        // Skip the current store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie'])
                            .send(
                                modifyDetails(
                                    {
                                        name: store.name,
                                        addressLine: store.location.addressLine,
                                        city: store.location.city,
                                        province: store.location.province,
                                        region: store.location.region
                                    },
                                    ' Update'
                                )
                            );

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
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Iterate over each store
                    for (const store of stores) {
                        // Skip the current store if it doesn't belong to the current user
                        if (store.owner.userId !== user.userId) continue;

                        // Send a PATCH request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .patch(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie'])
                            .send(
                                modifyDetails(
                                    {
                                        name: store.name,
                                        addressLine: store.location.addressLine,
                                        city: store.location.city,
                                        province: store.location.province,
                                        region: store.location.region
                                    },
                                    ' Update',
                                    true
                                )
                            );

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
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should not delete a store with an invalid storeId', async () => {
                // Generate an array of users asynchronously
                const users = await genUsers();

                // Generate stores asynchronously using the generated users
                await genStores(users);

                // Iterate through each user in the users array
                for (const user of users) {
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
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Filter stores not owned by user
                    const filteredStores = stores.filter((store) => store.owner.userId !== user.userId);

                    // Iterate over each filtered stores
                    for (const store of filteredStores) {
                        // Send a DELETE request to the '/stores/{storeId}' endpoint
                        const storeResponse = await chai
                            .request(app)
                            .delete(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        // Assert that the 'storeResponse' has a status code of 403
                        expect(storeResponse).to.have.status(403);
                        expect(storeResponse.body).to.have.property('name').equals('Forbidden');
                        expect(storeResponse.body)
                            .to.have.property('message')
                            .equals('You are not the owner of this store');
                    }
                }
            });

            it('should delete a store owned by user', async () => {
                // Generate a list of users
                const users = await genUsers();

                // Generate a list of stores, using the previously generated users
                const stores = await genStores(users);

                // Iterate over each user
                for (const user of users) {
                    // Send a POST request to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Filter owned stores by user
                    const filteredStores = stores.filter((store) => store.owner.userId === user.userId);

                    // Iterate over each filtered stores
                    for (const store of filteredStores) {
                        // Send a DELETE request to the '/stores/{storeId}' endpoint
                        const storesResponse = await chai
                            .request(app)
                            .delete(`/stores/${store.storeId}`)
                            // Set the 'Cookie' header with the value from the 'set-cookie' header in the login response
                            .set('Cookie', loginResponse.headers['set-cookie']);

                        expect(storesResponse).to.have.status(204);
                    }

                    // Send a GET request to the '/stores' endpoint
                    const storesResponse = await chai
                        .request(app)
                        .get('/stores')
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    expect(storesResponse).to.have.status(200);
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
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should return a user', async () => {
                // Fetch the users data asynchronously
                const users = await genUsers();

                // Iterate over each user
                for (const user of users) {
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
                        expect(res.body).to.have.property('name').equals('Unauthorized');

                        done();
                    });
            });

            it('should update a user', async () => {
                // Create users
                const users = await genUsers();

                // Iterate over each user
                for (const user of users) {
                    // Send a POST request to the '/auth/login' endpoint to log in the user
                    const loginResponse = await chai.request(app).post('/auth/login').send({
                        email: user.credentials.email,
                        password: user.credentials.password
                    });

                    // Send a PATCH request to the '/users' endpoint
                    const userResponse = await chai
                        .request(app)
                        .patch('/users')
                        // Set the 'Cookie' header with the value from the login response
                        .set('Cookie', loginResponse.headers['set-cookie'])
                        .send(modifyDetails({ firstName: user.name.first, lastName: user.name.last }, ' Update'));

                    // Perform assertions on the response
                    expect(userResponse).to.have.status(204);
                }
            });
        });
    });
});
