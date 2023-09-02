import app from '../src/index';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import envs from '../src/utilities/envs';

chai.use(chaiHttp);

describe('Admin authentication', () => {
    it('should not logged in with incorrect credentials', (done) => {
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

    it('should not logged out if not logged in', (done) => {
        chai.request(app)
            .post('/auth/logout')
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('should logged out if logged in', async (done) => {
        // Sending a POST request to the '/auth/login' endpoint with the given email and password
        const loginResponse = await chai.request(app).post('/auth/login').send({
            email: envs.ADMIN_EMAIL,
            password: envs.ADMIN_PASS
        });

        // Sending a POST request to the '/auth/logout' endpoint
        chai.request(app)
            .post('/auth/logout')
            // Setting the 'Cookie' header with the value from the 'set-cookie' header in the login response
            .set('Cookie', loginResponse.headers['set-cookie'])
            .end((err, res) => {
                expect(res).to.have.status(205);
                done();
            });
    });
});
