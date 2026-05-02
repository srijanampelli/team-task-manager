import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '15px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          {!isLogin && (
            <div className="input-group">
              <label>Role</label>
              <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '15px' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--accent-color)', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
