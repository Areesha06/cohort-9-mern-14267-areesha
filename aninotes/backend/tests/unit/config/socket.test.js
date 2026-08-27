import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { authenticateSocket } from '../../../src/config/socket.js';

describe('Unit: authenticateSocket', () => {
  it('should call next with an error when no token is provided', () => {
    const socket = { handshake: { auth: {} } };
    const next = sinon.spy();

    authenticateSocket(socket, next);

    expect(next.calledOnce).to.equal(true);
    expect(next.firstCall.args[0]).to.be.instanceOf(Error);
    expect(next.firstCall.args[0].message).to.equal('Authentication required');
  });

  it('should call next with an error for an invalid token', () => {
    const socket = { handshake: { auth: { token: 'garbage' } } };
    const next = sinon.spy();

    authenticateSocket(socket, next);

    expect(next.firstCall.args[0].message).to.equal('Invalid or expired token');
  });

  it('should attach userId to the socket and call next with no error for a valid token', () => {
    const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET);
    const socket = { handshake: { auth: { token } } };
    const next = sinon.spy();

    authenticateSocket(socket, next);

    expect(socket.userId).to.equal('user123');
    expect(next.calledOnceWithExactly()).to.equal(true);
  });
});
