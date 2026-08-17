import { Link } from 'react-router-dom';
import { formatDate, getContentPreview } from '../../utils/formatters';
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
            <p className="note-card__preview">{getContentPreview(note.content)}</p>
            <div className="note-card__footer">
                <span className="note-card__date">Updated {formatDate(note.updatedAt)}</span>
            </div>
        </Link>

        <button
            className="note-card__delete"
            onClick={handleDelete}
            aria-label={`Delete note titled ${note.title}`}
        >
            🗑
        </button>
    </div>
  );
};

export default NoteCard;
