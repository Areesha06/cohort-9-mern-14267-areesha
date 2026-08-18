import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { getMeRequest } from '../api/authApi';
import { routerFuture } from '../test-utils/routerFuture';

jest.mock('../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

const renderProtected = (route) =>
  render(
    <MemoryRouter initialEntries={[route]} future={routerFuture}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><div>Secret Dashboard</div></ProtectedRoute>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('redirects to /login when there is no authenticated user', async () => {
    renderProtected('/dashboard');
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content when the user is authenticated', async () => {
    localStorage.setItem('aninotes_token', 'fake-token');
    getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe' } } });

    renderProtected('/dashboard');
    expect(await screen.findByText('Secret Dashboard')).toBeInTheDocument();
  });
});
