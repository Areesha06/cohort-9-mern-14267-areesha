import { useRef } from 'react';
import './NotesToolbar.css';

const NotesToolbar = ({ onExport, onImportFiles, isExporting, isImporting }) => {
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

  return (
    <div className="notes-toolbar">
      <button type="button" className="notes-toolbar__btn" onClick={onExport} disabled={isExporting}>
        {isExporting ? 'Exporting…' : '⬇ Export notes'}
      </button>

      <button type="button" className="notes-toolbar__btn" onClick={handleImportClick} disabled={isImporting}>
        {isImporting ? 'Importing…' : '⬆ Import notes'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        multiple
        onChange={handleFileChange}
        className="notes-toolbar__file-input"
        aria-label="Import note files"
      />
    </div>
  );
};

export default NotesToolbar;
