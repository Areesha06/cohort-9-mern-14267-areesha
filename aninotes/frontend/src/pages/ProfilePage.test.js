import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { AuthProvider } from '../context/AuthContext';
import { getMeRequest } from '../api/authApi';
import { getNotesRequest } from '../api/notesApi';
import { routerFuture } from '../test-utils/routerFuture';

jest.mock('../api/authApi', () => ({
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
  getMeRequest: jest.fn(),
}));

jest.mock('../api/notesApi', () => ({
  getNotesRequest: jest.fn(),
  getNoteRequest: jest.fn(),
  createNoteRequest: jest.fn(),
  updateNoteRequest: jest.fn(),
  deleteNoteRequest: jest.fn(),
}));

const renderProfile = () => {
  localStorage.setItem('aninotes_token', 'fake-token');
  getMeRequest.mockResolvedValue({
    data: { data: { username: 'johndoe', email: 'john@example.com', createdAt: '2026-01-01T00:00:00.000Z' } },
  });

  return render(
    <MemoryRouter initialEntries={['/profile']} future={routerFuture}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("displays the user's username and email", async () => {
    getNotesRequest.mockResolvedValue({ data: { count: 3, data: [] } });
    renderProfile();

    expect(await screen.findByText('johndoe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays the notes count once loaded', async () => {
    getNotesRequest.mockResolvedValue({ data: { count: 5, data: [] } });
    renderProfile();

    expect(await screen.findByText('5')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('shows a fallback dash if the notes count fails to load', async () => {
    getNotesRequest.mockRejectedValue(new Error('Network error'));
    renderProfile();

    await screen.findByText('johndoe');
    await waitFor(() => expect(screen.getByText('—')).toBeInTheDocument());
  });

  it('displays a formatted "member since" date', async () => {
    getNotesRequest.mockResolvedValue({ data: { count: 0, data: [] } });
    renderProfile();

    expect(await screen.findByText(/jan.*2026/i)).toBeInTheDocument();
  });

  it('logs the user out and returns to dashboard route context when Log out is clicked', async () => {
    getNotesRequest.mockResolvedValue({ data: { count: 0, data: [] } });
    renderProfile();

    await screen.findByText('johndoe');
    await userEvent.click(screen.getByRole('button', { name: /log out/i }));

    expect(localStorage.getItem('aninotes_token')).toBeNull();
  });

  it('has a working back link to the dashboard', async () => {
    getNotesRequest.mockResolvedValue({ data: { count: 0, data: [] } });
    renderProfile();

    await screen.findByText('johndoe');
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/dashboard');
  });
});
