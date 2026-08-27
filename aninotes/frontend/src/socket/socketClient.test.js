jest.mock('socket.io-client');

import { io } from 'socket.io-client';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from './socketClient';

describe('socketClient', () => {
  afterEach(() => {
    disconnectSocket();
    jest.clearAllMocks();
  });

  it('connects with the given token in the auth payload', () => {
    connectSocket('fake-token');

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'fake-token' },
      })
    );
  });

  it('returns the active socket via getSocket', () => {
    connectSocket('fake-token');

    expect(getSocket()).not.toBeNull();
  });

  it('disconnects and clears the stored socket reference', () => {
    connectSocket('fake-token');

    disconnectSocket();

    expect(getSocket()).toBeNull();
  });
});
