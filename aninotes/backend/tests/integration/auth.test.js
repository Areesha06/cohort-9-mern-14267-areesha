import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';

describe('Integration: /api/auth', () => {
  const validUser = { username: 'johndoe', email: 'john@example.com', password: 'secret123' };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).to.equal(201);
      expect(res.body.data.email).to.equal(validUser.email);
      expect(res.body.data).to.not.have.property('password');
    });

    it('should reject a duplicate email with 409', async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const res = await request(app).post('/api/auth/register').send(validUser);

      expect(res.status).to.equal(409);
    });

    it('should reject missing fields with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'x@example.com' });
      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an('array');
    });

    it('should reject an invalid email format with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...validUser, email: 'not-an-email' });
      expect(res.status).to.equal(400);
    });

    it('should reject a password shorter than 6 characters with 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...validUser, password: '123' });
      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should log in with correct credentials and return a token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body.token).to.be.a('string');
    });

    it('should reject an incorrect password with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'wrongpassword',
      });
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid email or password');
    });

    it('should reject a nonexistent email with the same generic 401 message', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'secret123',
      });
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Invalid email or password');
    });

    it('should reject a login with missing fields with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: validUser.email });
      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
      const loginRes = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password,
      });
      token = loginRes.body.token;
    });

    it('should reject a request with no token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).to.equal(401);
    });

    it('should reject a malformed Authorization header with 401', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', token);
      expect(res.status).to.equal(401);
    });

    it('should reject an invalid token with 401', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage');
      expect(res.status).to.equal(401);
    });

    it('should return the current user for a valid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body.data.email).to.equal(validUser.email);
    });

    it('should reject an expired token with 401', async () => {
      const expiredToken = jwt.sign({ id: 'someid' }, process.env.JWT_SECRET, { expiresIn: '-10s' });
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Not authorized, invalid or expired token');
    });
  });
});
