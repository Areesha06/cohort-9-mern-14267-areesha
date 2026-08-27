jest.mock('../../socket/socketClient', () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
  getSocket: jest.fn(),
}));

import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { AuthProvider } from '../../context/AuthContext';
import { getMeRequest } from '../../api/authApi';
import { getSocket } from '../../socket/socketClient';
import { routerFuture } from '../../test-utils/routerFuture';

jest.mock('../../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

const mockSocket = {
  connected: false,
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
};

const renderHeader = () => {
  localStorage.setItem('aninotes_token', 'fake-token');

  getMeRequest.mockResolvedValue({
    data: {
      data: {
        username: 'johndoe',
      },
    },
  });

  getSocket.mockReturnValue(mockSocket);

  return render(
    <MemoryRouter future={routerFuture}>
      <AuthProvider>
        <DashboardHeader />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('DashboardHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    mockSocket.connected = false;
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
    mockSocket.disconnect.mockClear();

    getSocket.mockReturnValue(mockSocket);
  });

  it('shows a live-updates indicator', async () => {
    renderHeader();

    expect(
      await screen.findByTitle(/live updates/i)
    ).toBeInTheDocument();
  });

  it('reflects a connected state when the socket emits "connect"', async () => {
    renderHeader();

    await screen.findByText(/hi, johndoe/i);

    const connectCall = mockSocket.on.mock.calls.find(
      ([event]) => event === 'connect'
    );

    expect(connectCall).toBeDefined();

    const connectHandler = connectCall[1];

    act(() => {
      connectHandler();
    });

    expect(
      await screen.findByTitle('Live updates connected')
    ).toBeInTheDocument();
  });
});
