import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NoteEditorPage from './NoteEditorPage';
import { AuthProvider } from '../context/AuthContext';
import { getMeRequest } from '../api/authApi';
import { getNoteRequest, createNoteRequest, updateNoteRequest } from '../api/notesApi';
import { routerFuture } from '../test-utils/routerFuture';

jest.mock('react-quill-new', () => {
  return function MockReactQuill({ value, onChange, placeholder }) {
    return (
      <textarea
        aria-label="Content"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

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

const renderEditor = (route) => {
  localStorage.setItem('aninotes_token', 'fake-token');
  getMeRequest.mockResolvedValue({ data: { data: { username: 'johndoe' } } });

  return render(
    <MemoryRouter initialEntries={[route]} future={routerFuture}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/notes/new" element={<NoteEditorPage />} />
          <Route path="/notes/:id" element={<NoteEditorPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('NoteEditorPage — create mode', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows "New Note" as the page title', async () => {
    renderEditor('/notes/new');
    expect(await screen.findByText('New Note')).toBeInTheDocument();
  });

  it('shows validation errors for both empty title and empty content', async () => {
    renderEditor('/notes/new');
    await screen.findByText('New Note');

    await userEvent.click(screen.getByRole('button', { name: /create note/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Content is required')).toBeInTheDocument();
    expect(createNoteRequest).not.toHaveBeenCalled();
  });

  it('creates the note and navigates to the dashboard on success', async () => {
    createNoteRequest.mockResolvedValue({ data: { data: { _id: 'new1' } } });
    renderEditor('/notes/new');
    await screen.findByText('New Note');

    await userEvent.type(screen.getByLabelText(/title/i), 'My New Note');
    await userEvent.type(screen.getByLabelText('Content'), 'Some content');
    await userEvent.click(screen.getByRole('button', { name: /create note/i }));

    await waitFor(() =>
      expect(createNoteRequest).toHaveBeenCalledWith({ title: 'My New Note', content: 'Some content' })
    );
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('disables the save button while the request is in flight', async () => {
    let resolvePromise;
    createNoteRequest.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

    renderEditor('/notes/new');
    await screen.findByText('New Note');

    await userEvent.type(screen.getByLabelText(/title/i), 'Title');
    await userEvent.type(screen.getByLabelText('Content'), 'Content');
    await userEvent.click(screen.getByRole('button', { name: /create note/i }));

    expect(await screen.findByRole('button', { name: /saving/i })).toBeDisabled();

    resolvePromise({ data: { data: { _id: 'x' } } });
  });

  it('navigates back to the dashboard when Cancel is clicked', async () => {
    renderEditor('/notes/new');
    await screen.findByText('New Note');

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    expect(createNoteRequest).not.toHaveBeenCalled();
  });
});

describe('NoteEditorPage — edit mode', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows a loading state while fetching the note', () => {
    getNoteRequest.mockReturnValue(new Promise(() => {}));
    renderEditor('/notes/abc123');
    expect(screen.getByText(/loading your note/i)).toBeInTheDocument();
  });

  it('pre-fills the form with the fetched note', async () => {
    getNoteRequest.mockResolvedValue({
      data: { data: { _id: 'abc123', title: 'Existing Note', content: 'Existing content' } },
    });

    renderEditor('/notes/abc123');

    expect(await screen.findByDisplayValue('Existing Note')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
    expect(screen.getByText('Edit Note')).toBeInTheDocument();
  });

  it('saves changes and navigates to the dashboard', async () => {
    getNoteRequest.mockResolvedValue({
      data: { data: { _id: 'abc123', title: 'Existing Note', content: 'Existing content' } },
    });
    updateNoteRequest.mockResolvedValue({ data: { data: { _id: 'abc123' } } });

    renderEditor('/notes/abc123');
    await screen.findByDisplayValue('Existing Note');

    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Title');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(updateNoteRequest).toHaveBeenCalledWith('abc123', {
        title: 'Updated Title',
        content: 'Existing content',
      })
    );
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows a friendly not-found message for a note that does not exist', async () => {
    getNoteRequest.mockRejectedValue({ response: { status: 404 } });
    renderEditor('/notes/doesnotexist');

    expect(await screen.findByText(/couldn.t find that note/i)).toBeInTheDocument();
  });
});
