import Mascot from './Mascot';
import './AuthLayout.css';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="washi-tape washi-tape--one" aria-hidden="true" />
        <div className="washi-tape washi-tape--two" aria-hidden="true" />
        <div className="sticky-note sticky-note--one" aria-hidden="true">jot it down</div>
        <div className="sticky-note sticky-note--two" aria-hidden="true">stay tidy</div>
        <Mascot />
        <p className="auth-illustration__tagline">Your thoughts, adorably organized.</p>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <span className="auth-card__logo">AniNotes</span>
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
