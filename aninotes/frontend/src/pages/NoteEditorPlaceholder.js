import { useParams, Link } from 'react-router-dom';
import './NoteEditorPlaceholder.css';

const NoteEditorPlaceholder = () => {
  const { id } = useParams();
  const isNew = !id;

  return (
    <div className="note-editor-placeholder">
      <div className="note-editor-placeholder__card">
        <h1>{isNew ? 'New note' : 'Edit note'}</h1>
        <p>The rich text note editor is coming in the next feature — this route is just wired up so navigation already works.</p>
        <Link to="/dashboard" className="note-editor-placeholder__back">← Back to dashboard</Link>
      </div>
    </div>
  );
};

export default NoteEditorPlaceholder;
