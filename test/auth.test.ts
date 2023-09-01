import { after } from 'mocha';
import { expect } from 'chai';
import app from '../src/app';
import mongoose from 'mongoose';
import request from 'supertest';
import envs from '../src/utilities/envs';

before(() => {
    mongoose.connect(envs.MONGO_URI).then(() => {
        console.log('Connected to database');
    });
});

describe('/auth', () => {
    it('prevents login as user is not registered', (done) => {
        request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({
                email: 'test@email.com',
                password: 'test1'
            })
            .expect('Content-Type', /json/)
            .expect(401)
            .then((res) => {
                expect(res.body.name).equal('Unauthorized');
                done();
            });
    });

    it('prevents user registration as user details are incomplete', () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                firstName: 'test',
                email: 'test@email.com',
                password: 'test1'
            })
            .expect('Content-Type', /json/)
            .expect(422)
            .then((res) => {
                expect(res.body.name).equal('Unprocessable Entity');
            });
    });

    it("prevents user registration as user's email and password are incorrectly formatted", () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                firstName: 'test',
                email: 'test',
                password: 'test1'
            })
            .expect('Content-Type', /json/)
            .expect(422)
            .then((res) => {
                expect(res.body.name).equal('Unprocessable Entity');
            });
    });

    it('allows user registration', () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                firstName: 'test',
                middleName: 'test',
                lastName: 'test',
                extensionName: 'test',
                email: 'test1@email.com',
                password: 'Testing1!'
            })
            .expect('Content-Type', /json/)
            .expect(201);
    });

    it('allows user registration even when optional fields are missing', () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                firstName: 'test',
                lastName: 'test',
                email: 'test2@email.com',
                password: 'Testing2!'
            })
            .expect('Content-Type', /json/)
            .expect(201);
    });

    it('prevents login as credentials are incomplete', () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                email: 'test1@email.com'
            })
            .expect('Content-Type', /json/)
            .expect(422)
            .then((res) => {
                expect(res.body.name).equal('Unprocessable Entity');
            });
    });

    it('prevents login as crendetials are incorrect', () => {
        request(app)
            .post('/auth/register')
            .set('Accept', 'application/json')
            .send({
                email: 'test1@email.com',
                password: 'Testing2!'
            })
            .expect('Content-Type', /json/)
            .expect(422)
            .then((res) => {
                expect(res.body.name).equal('Unprocessable Entity');
            });
    });

    it('allows user login', () => {
        request(app)
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({
                email: 'test2@email.com',
                password: 'Testing2!'
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                // expect(res.headers['set-cookie']).not.to.be.empty;
                console.log(res.headers['set-cookie']);
            });
    });

    it('allows user logout', () => {
        request(app).post('/auth/logout').set('Accept', 'application/json').expect('Content-Type', /json/).expect(204);
    });

    it('prevents user logout as it is not logged in', () => {
        request(app)
            .post('/auth/logout')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
            .then((res) => {
                expect(res.body.name).equal('Unauthorized');
            });
    });
});

after(() => {
    // mongoose.disconnect().then(() => {
    //     console.log('Disconnected from database');
    // })
    mongoose.connection.close().then(() => {
        console.log('Database disconnected');
    });
    // mongoose.connection.on('close', () => {
    //     console.log('Database disconnected');
    // });
});
