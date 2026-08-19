import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { getMeRequest } from '../api/authApi';
import { getNotesRequest, deleteNoteRequest } from '../api/notesApi';
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

const sampleNotes = [
  { _id: '1', title: 'First Note', content: '<p>Hello</p>', updatedAt: '2026-01-10T10:00:00.000Z' },
  { _id: '2', title: 'Second Note', content: '<p>World</p>', updatedAt: '2026-01-11T10:00:00.000Z' },
];

const renderDashboard = () => {
  localStorage.setItem('aninotes_token', 'fake-token');
  getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe' } } });

  return render(
    <MemoryRouter initialEntries={['/dashboard']} future={routerFuture}>
      <AuthProvider><DashboardPage /></AuthProvider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows a loading state while notes are being fetched', () => {
    getNotesRequest.mockReturnValue(new Promise(() => {})); // never resolves
    renderDashboard();
    expect(screen.getByText(/loading your notes/i)).toBeInTheDocument();
  });

  it('shows the empty state when the user has no notes', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    expect(await screen.findByText('No notes yet!')).toBeInTheDocument();
  });

  it('renders a card for each note, and greets the logged-in user', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    renderDashboard();

    expect(await screen.findByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.getByText(/hi, johndoe/i)).toBeInTheDocument();
  });

  it('shows an error state with a retry button when fetching fails', async () => {
    getNotesRequest.mockRejectedValue(new Error('Network Error'));
    renderDashboard();

    expect(await screen.findByText('Could not load your notes. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('removes a note from the list after a successful delete', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    deleteNoteRequest.mockResolvedValue({ data: { success: true } });
    window.confirm = jest.fn(() => true);

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.click(screen.getAllByRole('button', { name: /delete note/i })[0]);

    await waitFor(() => expect(deleteNoteRequest).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(screen.queryByText('First Note')).not.toBeInTheDocument());
  });

  it('does not delete the note if the user cancels the confirmation', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    window.confirm = jest.fn(() => false);

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.click(screen.getAllByRole('button', { name: /delete note/i })[0]);

    expect(deleteNoteRequest).not.toHaveBeenCalled();
    expect(screen.getByText('First Note')).toBeInTheDocument();
  });
});
