import { useEffect, useState, useCallback } from 'react';
import DashboardHeader from '../components/notes/DashboardHeader';
import SearchBar from '../components/notes/SearchBar';
import NoteList from '../components/notes/NoteList';
import EmptyNotesState from '../components/notes/EmptyNotesState';
import NotesToolbar from '../components/notes/NotesToolbar';
import ImportSummaryBanner from '../components/notes/ImportSummaryBanner';
import { getNotesRequest, createNoteRequest, deleteNoteRequest } from '../api/notesApi';
import { downloadExportFile, parseImportFiles } from '../utils/notesTransfer';
import { useDebounce } from '../hooks/useDebounce';
import './DashboardPage.css';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const fetchNotes = useCallback(async (search) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await getNotesRequest(search);
      setNotes(res.data.data);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not load your notes. Please try again.');
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await getNotesRequest();
      if (res.data.data.length === 0) {
        alert('You have no notes to export yet.');
        return;
      }
      downloadExportFile(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not export your notes. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFiles = async (files) => {
    setIsImporting(true);
    setImportSummary(null);

    const { validNotes, errors: parseErrors } = await parseImportFiles(files);

    if (validNotes.length === 0) {
      setImportSummary({ createdCount: 0, errors: parseErrors });
      setIsImporting(false);
      return;
    }

    const results = await Promise.allSettled(
      validNotes.map((note) => createNoteRequest({ title: note.title, content: note.content }))
    );

    const createErrors = [];
    let createdCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        createdCount += 1;
      } else {
        const note = validNotes[index];
        const message = result.reason?.response?.data?.message || 'Could not be created.';
        createErrors.push({ file: note.sourceFile, message: `"${note.title}" — ${message}` });
      }
    });

    setImportSummary({ createdCount, errors: [...parseErrors, ...createErrors] });
    setIsImporting(false);

    if (createdCount > 0) {
      fetchNotes(debouncedSearchTerm);
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <main className="dashboard-content">
        <h1 className="dashboard-content__title">My Notes</h1>

        <NotesToolbar
          onExport={handleExport}
          onImportFiles={handleImportFiles}
          isExporting={isExporting}
          isImporting={isImporting}
        />

        <ImportSummaryBanner summary={importSummary} onDismiss={() => setImportSummary(null)} />

        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {status === 'loading' && <p className="dashboard-state">Loading your notes…</p>}

        {status === 'error' && (
          <div className="dashboard-state dashboard-state--error">
            <p>{errorMessage}</p>
            <button onClick={() => fetchNotes(debouncedSearchTerm)} className="dashboard-state__retry">Try again</button>
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
