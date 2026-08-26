import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardHeader from '../components/notes/DashboardHeader';
import SearchBar from '../components/notes/SearchBar';
import NoteList from '../components/notes/NoteList';
import EmptyNotesState from '../components/notes/EmptyNotesState';
import { getNotesRequest, deleteNoteRequest } from '../api/notesApi';
import { useDebounce } from '../hooks/useDebounce';
import './DashboardPage.css';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const fetchGeneration = useRef(0);

  const fetchNotes = useCallback(async (search) => {
    const generation = ++fetchGeneration.current;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await getNotesRequest(search);

      if (generation !== fetchGeneration.current) {
        return;
      }

      setNotes(res.data.data);
      setStatus('success');
    } catch (error) {
      if (generation !== fetchGeneration.current) {
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          'Could not load your notes. Please try again.'
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchNotes(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchNotes]);

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm('Delete this note? This can’t be undone.');
    if (!confirmed) return;

    setNotes((current) => current.filter((note) => note._id !== noteId));

    try {
      await deleteNoteRequest(noteId);
    } catch (error) {
      await fetchNotes(debouncedSearchTerm);

      alert(
        error.response?.data?.message ||
          'Could not delete the note. Please try again.'
      );
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <main className="dashboard-content">
        <h1 className="dashboard-content__title">My Notes</h1>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {status === 'loading' && (
          <p className="dashboard-state">Loading your notes…</p>
        )}

        {status === 'error' && (
          <div className="dashboard-state dashboard-state--error">
            <p>{errorMessage}</p>
            <button
              onClick={() => fetchNotes(debouncedSearchTerm)}
              className="dashboard-state__retry"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'success' && notes.length === 0 && (
          <EmptyNotesState searchTerm={debouncedSearchTerm} />
        )}

        {status === 'success' && notes.length > 0 && (
          <NoteList notes={notes} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
