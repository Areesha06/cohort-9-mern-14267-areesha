import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';
import { AuthProvider } from '../context/AuthContext';
import { registerRequest, loginRequest } from '../api/authApi';
import { routerFuture } from '../test-utils/routerFuture';

jest.mock('../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

const renderSignupPage = () =>
  render(
    <MemoryRouter initialEntries={['/signup']} future={routerFuture}>
      <AuthProvider><SignupPage /></AuthProvider>
    </MemoryRouter>
  );

describe('SignupPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders username, email, and password fields', () => {
    renderSignupPage();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('registers and logs in automatically on success', async () => {
    registerRequest.mockResolvedValue({ data: { data: { username: 'johndoe', email: 'john@example.com' } } });
    loginRequest.mockResolvedValue({
      data: { token: 'fake-token', data: { username: 'johndoe', email: 'john@example.com' } },
    });

    renderSignupPage();
    await userEvent.type(screen.getByLabelText(/username/i), 'johndoe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(registerRequest).toHaveBeenCalled());
    await waitFor(() =>
      expect(loginRequest).toHaveBeenCalledWith({ email: 'john@example.com', password: 'secret123' })
    );
  });

  it('shows a banner error when the email is already registered', async () => {
    registerRequest.mockRejectedValue({
      response: { status: 409, data: { message: 'Email is already registered' } },
    });

    renderSignupPage();
    await userEvent.type(screen.getByLabelText(/username/i), 'johndoe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email is already registered')).toBeInTheDocument();
  });
});
