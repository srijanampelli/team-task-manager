import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-logo">Task Manager</div>
        <div className="nav-link" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>Dashboard</div>
        <div className="nav-link active">Projects</div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{user?.name} ({user?.role})</p>
          <button className="btn-secondary" onClick={logout} style={{ width: '100%' }}>Logout</button>
        </div>
      </div>
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Projects</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>
        
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="glass-panel" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => navigate(`/projects/${p._id}`)}>
              <h3>{p.name}</h3>
              <p>{p.description || 'No description provided.'}</p>
              <div style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Owner: {p.owner.name}
              </div>
            </div>
          ))}
          {projects.length === 0 && <p>No projects found. Create one!</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Create Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
