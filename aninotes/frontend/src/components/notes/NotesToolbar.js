import { useRef } from 'react';
import './NotesToolbar.css';

const NotesToolbar = ({
  isSelectMode,
  selectedCount,
  totalCount,
  onEnterSelectMode,
  onCancelSelect,
  onSelectAll,
  onDeselectAll,
  onExportSelected,
  onImportFiles,
  isExporting,
  isImporting,
}) => {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImportFiles(files);
    }
    e.target.value = '';
  };

  const allSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <div className="notes-toolbar">
      {isSelectMode ? (
        <>
          <span className="notes-toolbar__count">{selectedCount} selected</span>

          <button type="button" className="notes-toolbar__btn" onClick={allSelected ? onDeselectAll : onSelectAll}>
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>

          <button
            type="button"
            className="notes-toolbar__btn notes-toolbar__btn--primary"
            onClick={onExportSelected}
            disabled={selectedCount === 0 || isExporting}
          >
            {isExporting ? 'Exporting…' : `⬇ Export selected (${selectedCount})`}
          </button>

          <button type="button" className="notes-toolbar__btn" onClick={onCancelSelect}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <button type="button" className="notes-toolbar__btn" onClick={onEnterSelectMode} disabled={totalCount === 0}>
            🗂 Export notes
          </button>

          <button type="button" className="notes-toolbar__btn" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? 'Importing…' : '⬆ Import notes'}
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="text/plain,.txt"
        multiple
        onChange={handleFileChange}
        className="notes-toolbar__file-input"
        aria-label="Import note files"
      />
    </div>
  );
};

export default NotesToolbar;
