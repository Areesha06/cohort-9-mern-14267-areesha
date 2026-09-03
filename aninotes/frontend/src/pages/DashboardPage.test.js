jest.mock('../socket/socketClient', () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
  getSocket: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { AuthProvider } from '../context/AuthContext';
import { getMeRequest } from '../api/authApi';
import { getNotesRequest, createNoteRequest, deleteNoteRequest } from '../api/notesApi';
import { routerFuture } from '../test-utils/routerFuture';
import { getSocket } from '../socket/socketClient';

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

const mockSocket = {
  connected: false,
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
};

import { ToastProvider } from '../context/ToastContext';

const renderDashboard = () => {
  localStorage.setItem('aninotes_token', 'fake-token');
  getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe' } } });

  return render(
    <MemoryRouter initialEntries={['/dashboard']} future={routerFuture}>
      <ToastProvider>
        <AuthProvider><DashboardPage /></AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    getSocket.mockReturnValue(mockSocket);
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
    mockSocket.disconnect.mockClear();
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

  it('shows the confirm dialog and removes the note after confirming', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    deleteNoteRequest.mockResolvedValue({ data: { success: true } });

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.click(screen.getAllByRole('button', { name: /delete note/i })[0]);

    expect(await screen.findByText('Delete this note?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => expect(deleteNoteRequest).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(screen.queryByText('First Note')).not.toBeInTheDocument());
  });

  it('does not delete the note if the user cancels the confirm dialog', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.click(screen.getAllByRole('button', { name: /delete note/i })[0]);
    await screen.findByText('Delete this note?');

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(deleteNoteRequest).not.toHaveBeenCalled();
    expect(screen.getByText('First Note')).toBeInTheDocument();
  });

  it('shows a toast when deleting fails', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    deleteNoteRequest.mockRejectedValue({ response: { data: { message: 'Server error' } } });

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.click(screen.getAllByRole('button', { name: /delete note/i })[0]);
    await screen.findByText('Delete this note?');
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(await screen.findByText('Server error')).toBeInTheDocument();
    expect(await screen.findByText('First Note')).toBeInTheDocument();
  });

  it('renders a search bar', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    renderDashboard();
    expect(await screen.findByLabelText(/search notes/i)).toBeInTheDocument();
  });

  it('calls getNotesRequest with the search term after the debounce delay', async () => {
    getNotesRequest.mockResolvedValue({ data: { data: sampleNotes } });
    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.type(screen.getByLabelText(/search notes/i), 'grocery');

    await waitFor(
      () => expect(getNotesRequest).toHaveBeenCalledWith('grocery'),
      { timeout: 2000 }
    );
  });

  it('shows a "no matches" message when a search returns no results', async () => {
    getNotesRequest
      .mockResolvedValueOnce({ data: { data: sampleNotes } })
      .mockResolvedValueOnce({ data: { data: [] } });

    renderDashboard();
    await screen.findByText('First Note');

    await userEvent.type(screen.getByLabelText(/search notes/i), 'nomatch');

    expect(await screen.findByText('No matches found', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  describe('Export / Import', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('enters select mode and exports the checked note as a separate .txt file', async () => {
      getNotesRequest.mockResolvedValue({ data: { count: 2, data: sampleNotes } });
      renderDashboard();
      await screen.findByText('First Note');

      await userEvent.click(screen.getByRole('button', { name: /export notes/i }));
      await userEvent.click(screen.getByLabelText(/select note titled first note/i));
      await userEvent.click(screen.getByRole('button', { name: /export selected \(1\)/i }));

      await waitFor(() => expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1));
    });

    it('imports multiple .txt files as separate notes', async () => {
      getNotesRequest.mockResolvedValue({ data: { count: 2, data: sampleNotes } });
      createNoteRequest.mockResolvedValue({ data: { data: { _id: 'new1' } } });

      renderDashboard();
      await screen.findByText('First Note');

      const fileA = new File(['Imported A\n\nHello there'], 'a.txt', { type: 'text/plain' });
      const fileB = new File(['Imported B\n\nHi again'], 'b.txt', { type: 'text/plain' });

      await userEvent.upload(screen.getByLabelText(/import note files/i), [fileA, fileB]);

      expect(await screen.findByText(/2 notes imported successfully/i)).toBeInTheDocument();
      expect(createNoteRequest).toHaveBeenCalledTimes(2);
    });

    it('shows an error summary for an empty imported file', async () => {
      getNotesRequest.mockResolvedValue({ data: { count: 2, data: sampleNotes } });
      renderDashboard();
      await screen.findByText('First Note');

      const emptyFile = new File(['   '], 'empty.txt', { type: 'text/plain' });
      await userEvent.upload(screen.getByLabelText(/import note files/i), emptyFile);

      expect(await screen.findByText(/could not be imported/i)).toBeInTheDocument();
    });
  });

  describe('Real-time updates via Socket.IO', () => {
    it('refetches notes when a note:created event is received', async () => {
      getNotesRequest.mockResolvedValue({
        data: {
          count: 2,
          data: sampleNotes,
        },
      });

      getSocket.mockReturnValue(mockSocket);

      renderDashboard();

      await screen.findByText('First Note');

      getNotesRequest.mockClear();

      const socketCall = mockSocket.on.mock.calls.find(
        ([event]) => event === 'note:created'
      );

      expect(socketCall).toBeDefined();

      const handler = socketCall[1];

      handler();

      await waitFor(() => {
        expect(getNotesRequest).toHaveBeenCalled();
      });
    });
  });
});
