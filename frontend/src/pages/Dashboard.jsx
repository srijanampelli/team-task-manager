import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [token]);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-logo">Task Manager</div>
        <div className="nav-link active">Dashboard</div>
        <div className="nav-link" onClick={() => navigate('/projects')} style={{cursor: 'pointer'}}>Projects</div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{user?.name} ({user?.role})</p>
          <button className="btn-secondary" onClick={logout} style={{ width: '100%' }}>Logout</button>
        </div>
      </div>
      <div className="main-content">
        <h1>Dashboard Overview</h1>
        
        {metrics ? (
          <div className="dashboard-grid">
            <div className="glass-panel stat-card">
              <p>Total Tasks</p>
              <h3>{metrics.totalTasks}</h3>
            </div>
            <div className="glass-panel stat-card">
              <p>Your Tasks</p>
              <h3>{metrics.userTasks}</h3>
            </div>
            <div className="glass-panel stat-card">
              <p>Overdue</p>
              <h3 style={{color: 'var(--danger)'}}>{metrics.overdueTasks}</h3>
            </div>
          </div>
        ) : (
          <p>Loading metrics...</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
