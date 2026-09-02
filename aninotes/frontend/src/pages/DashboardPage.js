import { useEffect, useState, useCallback } from 'react';
import DashboardHeader from '../components/notes/DashboardHeader';
import SearchBar from '../components/notes/SearchBar';
import NoteList from '../components/notes/NoteList';
import EmptyNotesState from '../components/notes/EmptyNotesState';
import NotesToolbar from '../components/notes/NotesToolbar';
import ImportSummaryBanner from '../components/notes/ImportSummaryBanner';
import { getNotesRequest, createNoteRequest, deleteNoteRequest } from '../api/notesApi';
import { downloadNotesAsTxtFiles, parseImportFiles } from '../utils/notesTransfer';
import { useDebounce } from '../hooks/useDebounce';
import { getSocket } from '../socket/socketClient';
import './DashboardPage.css';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

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

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleRemoteChange = () => {
      fetchNotes(debouncedSearchTerm);
    };

    socket.on('note:created', handleRemoteChange);
    socket.on('note:updated', handleRemoteChange);
    socket.on('note:deleted', handleRemoteChange);

    return () => {
      socket.off('note:created', handleRemoteChange);
      socket.off('note:updated', handleRemoteChange);
      socket.off('note:deleted', handleRemoteChange);
    };
  }, [debouncedSearchTerm, fetchNotes]);

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

  const handleEnterSelectMode = () => {
    setIsSelectMode(true);
    setSelectedIds(new Set());
  };

  const handleCancelSelect = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (noteId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(notes.map((note) => note._id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleExportSelected = async () => {
    const selectedNotes = notes.filter((note) => selectedIds.has(note._id));
    if (selectedNotes.length === 0) return;

    setIsExporting(true);
    try {
      await downloadNotesAsTxtFiles(selectedNotes);
    } finally {
      setIsExporting(false);
      setIsSelectMode(false);
      setSelectedIds(new Set());
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
          isSelectMode={isSelectMode}
          selectedCount={selectedIds.size}
          totalCount={notes.length}
          onEnterSelectMode={handleEnterSelectMode}
          onCancelSelect={handleCancelSelect}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onExportSelected={handleExportSelected}
          onImportFiles={handleImportFiles}
          isExporting={isExporting}
          isImporting={isImporting}
        />

        <ImportSummaryBanner summary={importSummary} onDismiss={() => setImportSummary(null)} />

        {!isSelectMode && <SearchBar value={searchTerm} onChange={setSearchTerm} />}

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
          <NoteList
            notes={notes}
            onDelete={handleDelete}
            selectionMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
