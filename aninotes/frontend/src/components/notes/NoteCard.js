import { Link } from 'react-router-dom';
import { formatDate, sanitizeHtml } from '../../utils/formatters';
import './NoteCard.css';

const NoteCard = ({ note, onDelete, selectionMode = false, isSelected = false, onToggleSelect }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note._id);
  };

  const cardContent = (
    <>
      {selectionMode && (
        <input
          type="checkbox"
          className="note-card__checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(note._id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select note titled ${note.title}`}
        />
      )}
      <div className="note-card__tape" aria-hidden="true" />
      <h3 className="note-card__title">{note.title}</h3>
      <div
        className="note-card__preview"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
      />
      <div className="note-card__footer">
        <span className="note-card__date">Updated {formatDate(note.updatedAt)}</span>
        {!selectionMode && (
          <button
            className="note-card__delete"
            onClick={handleDelete}
            aria-label={`Delete note titled ${note.title}`}
          >
            🗑
          </button>
        )}
      </div>
    </>
  );

  if (selectionMode) {
    return (
      <div
        className={`note-card note-card--selectable ${isSelected ? 'is-selected' : ''}`}
        onClick={() => onToggleSelect(note._id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleSelect(note._id);
          }
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/notes/${note._id}`} className="note-card">
      {cardContent}
    </Link>
  );
};

export default NoteCard;
