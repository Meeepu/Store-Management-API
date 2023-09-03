import { StoreCreate } from '../src/api/store/store.types';
import app from '../src/index';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import envs from '../src/utilities/envs';
import genStores, { TestStore } from './generators/stores';
import genUsers from './generators/users';

chai.use(chaiHttp);

describe('ADMIN', () => {
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

            it('should get an empty array of stores if there are no registered stores', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a GET request to the '/stores' endpoint
                const storesResponse = await chai
                    .request(app)
                    .get('/stores')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie']);

                expect(storesResponse).to.have.status(200);
                expect(storesResponse.body).to.be.an('array').that.is.empty;
            });

            it('should get an array of stores if there are registered stores', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Create stores;
                await genStores();

                // Sending a GET request to the '/stores' endpoint
                const storesResponse = await chai
                    .request(app)
                    .get('/stores')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie']);

                expect(storesResponse).to.have.status(200);
                expect(storesResponse.body).to.be.an('array').that.is.not.empty;
            });
        });

        describe('POST /stores', () => {
            it('should not create a store if not logged in', (done) => {
                chai.request(app)
                    .post('/stores')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not create store with incomplete store details', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a POST request to the '/stores' endpoint
                const storesResponse = await chai
                    .request(app)
                    .post('/stores')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie'])
                    .send({
                        name: "Admin's store",
                        addressLine: '123 Main St',
                        province: 'CA'
                    });

                expect(storesResponse).to.have.status(422);
                expect(storesResponse.body).to.have.property('message').to.be.an('array').with.lengthOf(2);

                // Assert that there is at least one item in the 'message' array where 'path' is equal to 'location.region'
                expect(storesResponse.body.message.some(({ path }) => path === 'location.region')).to.be.true;

                // Assert that there is at least one item in the 'message' array where 'path' is equal to 'location.city'
                expect(storesResponse.body.message.some(({ path }) => path === 'location.city')).to.be.true;
            });

            it('should create a store', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a POST request to the '/stores' endpoint
                const storesResponse = await chai
                    .request(app)
                    .post('/stores')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie'])
                    .send({
                        name: "Admin's store",
                        addressLine: '123 Main St',
                        city: 'San Francisco',
                        province: 'CA',
                        region: 'CA'
                    });

                expect(storesResponse).to.have.status(201);
            });
        });

        describe('GET /stores/{storeId}', () => {
            it('should not get a store if not logged in', (done) => {
                chai.request(app)
                    .get('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not get a store with an invalid storeId', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a GET request to the '/stores/{storeId}' endpoint
                const storesResponse = await chai
                    .request(app)
                    .get('/stores/1')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie']);

                expect(storesResponse).to.have.status(404);
            });

            it('should get a store', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                const cookie = loginResponse.headers['set-cookie'];

                // Create stores
                const stores = await genStores();

                for (let i = 0; i < stores.length; i++) {
                    const store = stores[i];

                    // Sending a GET request to the '/stores/{storeId}' endpoint
                    const storeResponse = await chai.request(app).get(`/stores/${store.storeId}`).set('Cookie', cookie);

                    expect(storeResponse).to.have.status(200);
                    expect(storeResponse.body).to.have.property('storeId').equals(store.storeId);
                }
            });
        });

        describe('PATCH /stores/{storeId}', () => {
            it('should not update a store if not logged in', (done) => {
                chai.request(app)
                    .put('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not update a store with an invalid storeId', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a PATCH request to the '/stores/{storeId}' endpoint
                const storesResponse = await chai
                    .request(app)
                    .patch('/stores/1')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie'])
                    .send({
                        name: "Admin's store",
                        addressLine: '123 Main St',
                        city: 'San Francisco',
                        province: 'CA',
                        region: 'CA'
                    });

                expect(storesResponse).to.have.status(404);
            });

            it('should update a store with complete store details', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Extracting the cookie from the response headers
                const cookie = loginResponse.headers['set-cookie'];

                // Create stores
                const stores = await genStores();

                // Looping through each store
                for (let i = 0; i < stores.length; i++) {
                    const store = stores[i];

                    // Sending a PATCH request to the '/stores/{storeId}' endpoint
                    const storeResponse = await chai
                        .request(app)
                        .patch(`/stores/${store.storeId}`)
                        .set('Cookie', cookie)
                        .send({
                            // Updating the store details
                            name: `${store.name} udpated`,
                            addressLine: `${store.location.addressLine} udpated`,
                            city: `${store.location.city} udpated`,
                            province: `${store.location.province} udpated`,
                            region: `${store.location.region} udpated`
                        });

                    // Asserting that the response status is 204 (No Content)
                    expect(storeResponse).to.have.status(204);
                }
            });

            it('should update a store with incomplete store details', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Extracting the 'set-cookie' header from the login response
                const cookie = loginResponse.headers['set-cookie'];

                // Function to randomly pick properties to update for a store
                function propertyPicker(testStore: TestStore) {
                    const store: StoreCreate = {
                        name: `${testStore.name} udpated`,
                        addressLine: `${testStore.location.addressLine} udpated`,
                        city: `${testStore.location.city} udpated`,
                        province: `${testStore.location.province} udpated`,
                        region: `${testStore.location.region} udpated`
                    };

                    const index = Math.floor(Math.random() * 5);
                    const entries = Object.entries(store);

                    entries.splice(index, 1);

                    return Object.fromEntries(entries);
                }

                // Create stores
                const stores = await genStores();

                // Looping through each store
                for (let i = 0; i < stores.length; i++) {
                    const store = stores[i];

                    // Sending a PATCH request to the '/stores/{storeId}' endpoint
                    const storeResponse = await chai
                        .request(app)
                        .patch(`/stores/${store.storeId}`)
                        .set('Cookie', cookie)
                        .send(propertyPicker(store));

                    // Expecting the store response status to be 204 (No Content)
                    expect(storeResponse).to.have.status(204);
                }
            });
        });

        describe('DELETE /stores/{storeId}', () => {
            it('should not delete a store if not logged in', (done) => {
                chai.request(app)
                    .delete('/stores/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not delete a store with an invalid storeId', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a DELETE request to the '/stores/{storeId}' endpoint
                const storesResponse = await chai
                    .request(app)
                    .delete('/stores/1')
                    // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
                    .set('Cookie', loginResponse.headers['set-cookie']);

                // Asserting that the response status is 404 (Not Found)
                expect(storesResponse).to.have.status(404);
            });

            it('should delete a store', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Extracting the 'set-cookie' header from the login response
                const cookie = loginResponse.headers['set-cookie'];

                // Creating stores
                const stores = await genStores();

                // Randomly select a store to be deleted
                const store = stores[Math.floor(Math.random() * stores.length)];

                // Sending a DELETE request to the '/stores/{storeId}' endpoint
                const storesResponse = await chai.request(app).delete(`/stores/${store.storeId}`).set('Cookie', cookie);

                // Asserting that the response status is 204 (No Content)
                expect(storesResponse).to.have.status(204);

                // Sending a GET request to the '/stores/{storeId}' endpoint
                const storeResponse = await chai.request(app).get(`/stores/${store.storeId}`).set('Cookie', cookie);

                // Asserting that the response status is 404 (Not Found)
                expect(storeResponse).to.have.status(404);
            });

            it('should delete all stores', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                const cookie = loginResponse.headers['set-cookie'];

                // Create stores
                const stores = await genStores();

                // Looping through each store
                for (let i = 0; i < stores.length; i++) {
                    const store = stores[i];

                    // Sending a DELETE request to the '/stores/{storeId}' endpoint
                    const storeResponse = await chai
                        .request(app)
                        .delete(`/stores/${store.storeId}`)
                        .set('Cookie', cookie);

                    // Asserting that the response status is 204 (No Content)
                    expect(storeResponse).to.have.status(204);
                }

                // Sending a GET request to the '/stores' endpoint
                const storesResponse = await chai.request(app).get('/stores').set('Cookie', cookie);

                // Asserting that the response status is 200 (OK)
                expect(storesResponse).to.have.status(200);

                // Asserting that the response body is an empty array
                expect(storesResponse.body).to.be.an('array').that.is.empty;
            });
        });
    });

    describe('User Management', () => {
        describe('GET /users', () => {
            it('should not get all users if not logged in', (done) => {
                chai.request(app)
                    .get('/users')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should get get an empty array of users if there are no registered users', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a GET request to the '/users' endpoint
                const usersResponse = await chai
                    .request(app)
                    .get('/users')
                    .set('Cookie', loginResponse.headers['set-cookie']);

                // Asserting that the response status is 200 (OK)
                expect(usersResponse).to.have.status(200);

                // Asserting that the response body is an empty array
                expect(usersResponse.body).to.be.an('array').that.is.empty;
            });

            it('should get all users', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Create users
                const users = await genUsers();

                // Sending a GET request to the '/users' endpoint
                const usersResponse = await chai
                    .request(app)
                    .get('/users')
                    .set('Cookie', loginResponse.headers['set-cookie']);

                // Asserting that the response status is 200 (OK)
                expect(usersResponse).to.have.status(200);

                // Asserting that the response body is an array with the same length of 'users'
                expect(usersResponse.body).to.be.an('array').with.lengthOf(users.length);
            });
        });

        describe('PATCH /users', () => {
            it('should not update a user if not logged in', (done) => {
                chai.request(app)
                    .patch('/users/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });
        });

        describe('GET /users/{userId}', () => {
            it('should not get a user if not logged in', (done) => {
                chai.request(app)
                    .get('/users/1')
                    .end((err, res) => {
                        expect(res).to.have.status(401);
                        done();
                    });
            });

            it('should not get a user with an invalid userId', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Sending a GET request to the '/users/{userId}' endpoint with an invalid userId
                const usersResponse = await chai
                    .request(app)
                    .get('/users/1')
                    .set('Cookie', loginResponse.headers['set-cookie']);

                // Asserting that the response status is 404 (Not Found)
                expect(usersResponse).to.have.status(404);
            });

            it('should get a user with valid userId', async () => {
                // Sending a POST request to the '/auth/login' endpoint with the given email and password
                const loginResponse = await chai.request(app).post('/auth/login').send({
                    email: envs.ADMIN_EMAIL,
                    password: envs.ADMIN_PASS
                });

                // Create users
                const users = await genUsers();

                for (let i = 0; i < users.length; i++) {
                    const user = users[i];

                    // Sending a GET request to the '/users/{userId}' endpoint with a valid userId
                    const usersResponse = await chai
                        .request(app)
                        .get(`/users/${user.userId}`)
                        .set('Cookie', loginResponse.headers['set-cookie']);

                    // Asserting that the response status is 200 (OK)
                    expect(usersResponse).to.have.status(200);

                    // Asserting that the response body has the same userId
                    expect(usersResponse.body.userId).to.equal(user.userId);
                }
            });
        });
    });
});
