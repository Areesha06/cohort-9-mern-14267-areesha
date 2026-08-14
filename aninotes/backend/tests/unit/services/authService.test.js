import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import User from '../../../src/models/User.js';
import { createUser, loginUser } from '../../../src/services/authService.js';

describe('Unit: authService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createUser', () => {
    it('should create a user when the email is not already taken', async () => {
      sinon.stub(User, 'findOne').resolves(null);
      sinon.stub(User, 'create').resolves({
        _id: 'abc123',
        username: 'johndoe',
        email: 'john@example.com',
      });

      const user = await createUser({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'secret123',
      });

      expect(user.email).to.equal('john@example.com');
      expect(User.create.calledOnce).to.equal(true);
    });

    it('should throw a 409 error when the email is already registered', async () => {
      sinon.stub(User, 'findOne').resolves({ email: 'john@example.com' });

      try {
        await createUser({ username: 'johndoe', email: 'john@example.com', password: 'secret123' });
        expect.fail('Expected createUser to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(409);
        expect(error.message).to.equal('Email is already registered');
      }
    });
  });

  describe('loginUser', () => {
    it('should return a user and token when credentials are correct', async () => {
      const fakeUser = {
        _id: 'abc123',
        email: 'john@example.com',
        comparePassword: sinon.stub().resolves(true),
      };

      sinon.stub(User, 'findOne').returns({ select: sinon.stub().resolves(fakeUser) });

      const result = await loginUser({ email: 'john@example.com', password: 'secret123' });

      expect(result.user.email).to.equal('john@example.com');
      expect(result.token).to.be.a('string');
    });

    it('should throw a 401 error when the email does not exist', async () => {
      sinon.stub(User, 'findOne').returns({ select: sinon.stub().resolves(null) });
      sinon.stub(bcrypt, 'compare').resolves(false);

      try {
        await loginUser({ email: 'nobody@example.com', password: 'secret123' });
        expect.fail('Expected loginUser to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Invalid email or password');
      }
    });

    it('should throw a 401 error when the password is incorrect', async () => {
      const fakeUser = {
        _id: 'abc123',
        email: 'john@example.com',
        comparePassword: sinon.stub().resolves(false),
      };

      sinon.stub(User, 'findOne').returns({ select: sinon.stub().resolves(fakeUser) });

      try {
        await loginUser({ email: 'john@example.com', password: 'wrongpass' });
        expect.fail('Expected loginUser to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(401);
        expect(error.message).to.equal('Invalid email or password');
      }
    });
  });
});
