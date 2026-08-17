import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import generateToken from '../../../src/utils/generateToken.js';

describe('Unit: generateToken', () => {
  it('should generate a token that encodes the given payload', () => {
    const token = generateToken({ id: 'user123' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).to.equal('user123');
  });

  it('should include an expiry claim on the token', () => {
    const token = generateToken({ id: 'user123' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).to.have.property('exp');
  });
});
