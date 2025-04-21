import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        {user && (
          <p className="user-greeting">
            Hello, {user.firstName || user.email}!
          </p>
        )}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Dashboard</h2>
          <p>This is a placeholder for the dashboard content.</p>
          <p>In future sprints, this page will be populated with relevant information based on the user's role.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
