import './SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search your notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search notes"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
