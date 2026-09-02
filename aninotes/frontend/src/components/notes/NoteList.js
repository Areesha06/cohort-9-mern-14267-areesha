import NoteCard from './NoteCard';
import './NoteList.css';

const NoteList = ({ notes, onDelete, selectionMode, selectedIds, onToggleSelect }) => {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          onDelete={onDelete}
          selectionMode={selectionMode}
          isSelected={selectedIds?.has(note._id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default NoteList;
