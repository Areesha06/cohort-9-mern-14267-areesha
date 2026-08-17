import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/User.js';
import protect from '../../../src/middlewares/authMiddleware.js';

describe('Unit: authMiddleware (protect)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call next() with a 401 error when there is no Authorization header', async () => {
    const req = { headers: {} };
    const next = sinon.spy();

    await protect(req, {}, next);

    const error = next.firstCall.args[0];
    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal('Not authorized, no token provided');
  });

  it('should call next() with a 401 error for a malformed Authorization header', async () => {
    const req = { headers: { authorization: 'sometoken' } };
    const next = sinon.spy();

    await protect(req, {}, next);

    expect(next.firstCall.args[0].statusCode).to.equal(401);
  });

  it('should call next() with a 401 error for an invalid token', async () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } };
    const next = sinon.spy();

    await protect(req, {}, next);

    const error = next.firstCall.args[0];
    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal('Not authorized, invalid or expired token');
  });

  it('should call next() with a 401 error if the user referenced by the token no longer exists', async () => {
    const token = jwt.sign({ id: 'ghost-id' }, process.env.JWT_SECRET);
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(null) });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = sinon.spy();

    await protect(req, {}, next);

    const error = next.firstCall.args[0];
    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal('Not authorized, user no longer exists');
  });

  it('should attach the user to req and call next() with no error when the token is valid', async () => {
    const token = jwt.sign({ id: 'user1' }, process.env.JWT_SECRET);
    const fakeUser = { _id: 'user1', username: 'johndoe', email: 'john@example.com' };

    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(fakeUser) });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = sinon.spy();

    await protect(req, {}, next);

    expect(req.user).to.deep.equal(fakeUser);
    expect(next.calledOnceWithExactly()).to.equal(true);
  });
});
