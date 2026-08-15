const Mascot = () => (
  <svg
    viewBox="0 0 240 240"
    width="200"
    height="200"
    className="mascot"
    role="img"
    aria-label="Ani, the AniNotes mascot, sitting beside a notepad"
  >
    <ellipse cx="120" cy="215" rx="70" ry="12" fill="#3B2454" opacity="0.08" />
    <path
      d="M120 30c46 0 78 34 78 80 0 44-32 78-78 78s-78-34-78-78c0-46 32-80 78-80z"
      fill="#FFD1E3"
    />
    <circle cx="92" cy="118" r="8" fill="#3B2454" />
    <circle cx="150" cy="118" r="8" fill="#3B2454" />
    <path d="M100 148c8 10 34 10 42 0" stroke="#3B2454" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="78" cy="140" r="10" fill="#FF7FAE" opacity="0.5" />
    <circle cx="164" cy="140" r="10" fill="#FF7FAE" opacity="0.5" />
    <rect x="60" y="185" width="120" height="40" rx="10" fill="#7FE7C4" transform="rotate(-3 120 205)" />
    <rect x="70" y="192" width="100" height="6" rx="3" fill="#ffffff" opacity="0.7" transform="rotate(-3 120 205)" />
    <rect x="70" y="204" width="70" height="6" rx="3" fill="#ffffff" opacity="0.7" transform="rotate(-3 120 205)" />
  </svg>
);

export default Mascot;
