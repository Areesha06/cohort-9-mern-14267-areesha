import { useEffect, useState, useCallback } from 'react';
import DashboardHeader from '../components/notes/DashboardHeader';
import NoteList from '../components/notes/NoteList';
import EmptyNotesState from '../components/notes/EmptyNotesState';
import { getNotesRequest, deleteNoteRequest } from '../api/notesApi';
import './DashboardPage.css';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNotes = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await getNotesRequest();
      setNotes(res.data.data);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not load your notes. Please try again.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm('Delete this note? This can’t be undone.');
    if (!confirmed) return;

    const previousNotes = notes;
    setNotes((current) => current.filter((note) => note._id !== noteId));

    try {
      await deleteNoteRequest(noteId);
    } catch (error) {
      setNotes(previousNotes);
      alert(error.response?.data?.message || 'Could not delete the note. Please try again.');
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <main className="dashboard-content">
        <h1 className="dashboard-content__title">My Notes</h1>

        {status === 'loading' && <p className="dashboard-state">Loading your notes…</p>}

        {status === 'error' && (
          <div className="dashboard-state dashboard-state--error">
            <p>{errorMessage}</p>
            <button onClick={fetchNotes} className="dashboard-state__retry">Try again</button>
          </div>
        )}

        {status === 'success' && notes.length === 0 && <EmptyNotesState />}

        {status === 'success' && notes.length > 0 && (
          <NoteList notes={notes} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
