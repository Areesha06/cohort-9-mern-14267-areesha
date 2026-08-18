import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { loginRequest, getMeRequest } from '../api/authApi';

jest.mock('../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

const TestConsumer = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(isLoading)}</p>
      <p data-testid="authed">{String(isAuthenticated)}</p>
      <p data-testid="username">{user?.username || 'none'}</p>
      <button onClick={() => login({ email: 'john@example.com', password: 'secret123' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('starts with isLoading false and no user when there is no saved token', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('authed').textContent).toBe('false');
  });

  it('restores the session on load when a token already exists', async () => {
    localStorage.setItem('aninotes_token', 'fake-token');
    getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe', email: 'john@example.com' } } });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('true'));
    expect(screen.getByTestId('username').textContent).toBe('johndoe');
  });

  it('logs the user out if the saved token is no longer valid', async () => {
    localStorage.setItem('aninotes_token', 'expired-token');
    getMeRequest.mockRejectedValue({ response: { status: 401 } });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('false'));
    expect(localStorage.getItem('aninotes_token')).toBeNull();
  });

  it('logs in successfully and stores the token', async () => {
    loginRequest.mockResolvedValue({
      data: { token: 'new-token', data: { username: 'johndoe', email: 'john@example.com' } },
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('true'));
    expect(localStorage.getItem('aninotes_token')).toBe('new-token');
  });

  it('logs out and clears the token', async () => {
    localStorage.setItem('aninotes_token', 'fake-token');
    getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe' } } });

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('authed').textContent).toBe('true'));

    await userEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('authed').textContent).toBe('false');
    expect(localStorage.getItem('aninotes_token')).toBeNull();
  });
});
