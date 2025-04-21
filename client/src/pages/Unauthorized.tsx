import { Link } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <Link to="/dashboard" className="back-link">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
