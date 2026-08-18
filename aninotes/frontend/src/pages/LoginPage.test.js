import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { loginRequest } from '../api/authApi';
import { routerFuture } from '../test-utils/routerFuture';

jest.mock('../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

const renderLoginPage = () =>
  render(
    <MemoryRouter initialEntries={['/login']} future={routerFuture}>
      <AuthProvider><LoginPage /></AuthProvider>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders the email and password fields and a submit button', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('submits the form and calls loginRequest with the entered values', async () => {
    loginRequest.mockResolvedValue({
      data: { token: 'fake-token', data: { username: 'johndoe', email: 'john@example.com' } },
    });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() =>
      expect(loginRequest).toHaveBeenCalledWith({ email: 'john@example.com', password: 'secret123' })
    );
  });

  it('shows a banner error when login fails with invalid credentials', async () => {
    loginRequest.mockRejectedValue({
      response: { status: 401, data: { message: 'Invalid email or password' } },
    });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('shows field-level errors when the backend returns validation errors', async () => {
    loginRequest.mockRejectedValue({
      response: { status: 400, data: { errors: [{ field: 'password', message: 'Password is required' }] } },
    });

    renderLoginPage();
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });
});
