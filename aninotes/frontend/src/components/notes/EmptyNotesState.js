import { Link } from 'react-router-dom';
import './EmptyNotesState.css';

const EmptyNotesState = () => (
  <div className="empty-notes">
    <div className="empty-notes__blob" aria-hidden="true">📝</div>
    <h2>No notes yet!</h2>
    <p>Your notebook is looking a little empty. Jot down your first thought.</p>
    <Link to="/notes/new" className="empty-notes__cta">Create your first note</Link>
  </div>
);

export default EmptyNotesState;
