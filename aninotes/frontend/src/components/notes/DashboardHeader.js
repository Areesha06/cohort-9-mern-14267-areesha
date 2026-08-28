import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../profile/Avatar';
import './DashboardHeader.css';

const DashboardHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="dashboard-header">
      <span className="dashboard-header__logo">AniNotes</span>

      <div className="dashboard-header__actions">
        <Link to="/notes/new" className="dashboard-header__new-btn">+ New note</Link>

        <Link to="/profile" className="dashboard-header__profile-link" aria-label="View profile">
          <Avatar username={user?.username} size={34} />
          <span className="dashboard-header__greeting">Hi, {user?.username}</span>
        </Link>

        <button onClick={logout} className="dashboard-header__logout-btn">Log out</button>
      </div>
    </header>
  );
};

export default DashboardHeader;
