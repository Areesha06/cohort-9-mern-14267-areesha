import { expect } from 'chai';
import sinon from 'sinon';
import asyncHandler from '../../../src/utils/asyncHandler.js';

describe('Unit: asyncHandler', () => {
  it('should run the wrapped function normally when it succeeds', async () => {
    const req = {};
    const res = {};
    const next = sinon.spy();
    const handler = asyncHandler(async (req, res) => {
      res.done = true;
    });

    await handler(req, res, next);

    expect(res.done).to.equal(true);
    expect(next.called).to.equal(false);
  });

  it('should forward a thrown error to next()', async () => {
    const req = {};
    const res = {};
    const next = sinon.spy();
    const testError = new Error('Boom');

    const handler = asyncHandler(async () => {
      throw testError;
    });

    await handler(req, res, next);

    expect(next.calledOnceWith(testError)).to.equal(true);
  });
});
