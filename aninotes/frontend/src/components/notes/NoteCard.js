import { Link } from 'react-router-dom';
import { formatDate, sanitizeHtml } from '../../utils/formatters';
import './NoteCard.css';

const NoteCard = ({ note, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note._id);
  };

  return (
    <div className="note-card">
      <Link to={`/notes/${note._id}`} className="note-card__link">
        <div className="note-card__tape" aria-hidden="true" />
        <h3 className="note-card__title">{note.title}</h3>
        <div
          className="note-card__preview"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
        />
      </Link>

      <div className="note-card__footer">
        <span className="note-card__date">
          Updated {formatDate(note.updatedAt)}
        </span>

        <button
          type="button"
          className="note-card__delete"
          onClick={handleDelete}
          aria-label={`Delete note titled ${note.title}`}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
