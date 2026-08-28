import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotesRequest } from '../api/notesApi';
import Avatar from '../components/profile/Avatar';
import { formatDate } from '../utils/formatters';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [notesCount, setNotesCount] = useState(null);
  const [countStatus, setCountStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    const fetchCount = async () => {
      try {
        const res = await getNotesRequest();
        if (!isMounted) return;
        setNotesCount(res.data.count);
        setCountStatus('ready');
      } catch (error) {
        if (!isMounted) return;
        setCountStatus('error');
      }
    };

    fetchCount();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/dashboard" className="profile-back-link">← Back to dashboard</Link>

        <div className="profile-header">
          <Avatar username={user?.username} size={72} />
          <div>
            <h1 className="profile-username">{user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__value">
              {countStatus === 'loading' ? '…' : countStatus === 'error' ? '—' : notesCount}
            </span>
            <span className="profile-stat__label">Notes</span>
          </div>

          <div className="profile-stat">
            <span className="profile-stat__value">
              {user?.createdAt ? formatDate(user.createdAt) : '—'}
            </span>
            <span className="profile-stat__label">Member since</span>
          </div>
        </div>

        <button onClick={logout} className="profile-logout-btn">Log out</button>
      </div>
    </div>
  );
};

export default ProfilePage;
