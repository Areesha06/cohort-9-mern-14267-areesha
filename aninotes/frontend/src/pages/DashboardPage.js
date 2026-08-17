import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-placeholder">
      <h1>Hi {user?.username} 👋</h1>
      <p>Your notes dashboard is coming in the next feature!</p>
      <button onClick={logout} className="auth-submit" style={{ maxWidth: 160 }}>
        Log out
      </button>
    </div>
  );
};

export default DashboardPage;
