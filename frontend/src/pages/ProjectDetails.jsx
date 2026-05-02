import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', status: 'To Do', dueDate: '', assignee: '' });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id, token]);

  const fetchProjectAndTasks = async () => {
    try {
      const projRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(projRes.data);

      const tasksRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Default to assigning to self if no assignee selected
      const assigneeId = newTask.assignee || user.id;
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`, { ...newTask, project: id, assignee: assigneeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', status: 'To Do', dueDate: '', assignee: '' });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjectAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div>Loading...</div>;

  const renderColumn = (status, title, bgColor) => {
    const colTasks = tasks.filter(t => t.status === status);
    return (
      <div className="kanban-column">
        <h3 style={{ borderBottom: `2px solid ${bgColor}`, paddingBottom: '10px' }}>{title} ({colTasks.length})</h3>
        <div style={{ marginTop: '15px' }}>
          {colTasks.map(t => (
            <div key={t._id} className="task-card">
              <h4>{t.title}</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{t.description}</p>
              {t.assignee && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Assigned to: {t.assignee.name}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '10px' }}>
                <span style={{ color: t.priority === 'High' ? 'var(--danger)' : t.priority === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                  {t.priority} Priority
                </span>
                {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {status !== 'To Do' && <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => updateTaskStatus(t._id, status === 'Done' ? 'In Progress' : 'To Do')}>&larr;</button>}
                {status !== 'Done' && <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', marginLeft: 'auto' }} onClick={() => updateTaskStatus(t._id, status === 'To Do' ? 'In Progress' : 'Done')}>&rarr;</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-logo">Task Manager</div>
        <div className="nav-link" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>Dashboard</div>
        <div className="nav-link active" onClick={() => navigate('/projects')} style={{cursor: 'pointer'}}>Projects</div>
        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{user?.name} ({user?.role})</p>
          <button className="btn-secondary" onClick={logout} style={{ width: '100%' }}>Logout</button>
        </div>
      </div>
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1>{project.name}</h1>
          {user?.role === 'Admin' && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Task</button>}
        </div>
        <p style={{ marginBottom: '30px' }}>{project.description}</p>
        
        <div className="kanban-board">
          {renderColumn('To Do', 'To Do', '#3b82f6')}
          {renderColumn('In Progress', 'In Progress', '#f59e0b')}
          {renderColumn('Done', 'Done', '#10b981')}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Add Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Title</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Assign To</label>
                  <select value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                    <option value={project.owner._id}>{project.owner.name} (Admin)</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name} (Member)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetails;
