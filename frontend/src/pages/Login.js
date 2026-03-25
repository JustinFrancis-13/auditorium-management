import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const seedAndLogin = async () => {
    setLoading(true);
    try {
      await authAPI.seedAdmin();
      await login('admin@anurag.edu.in', 'admin123');
      toast.success('Logged in as Admin!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">AU</div>
          <h1>Anurag University</h1>
          <p>Smart Auditorium Management System</p>
        </div>
        <div className="auth-features">
          <div className="feature-item">🏛️ Manage multiple auditoriums</div>
          <div className="feature-item">📅 Real-time booking calendar</div>
          <div className="feature-item">✅ Instant approval workflow</div>
          <div className="feature-item">📊 Analytics & Reports</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card fade-in">
          <h2>Sign In</h2>
          <p className="auth-subtitle">Access Anurag University Auditorium Portal</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="your@anurag.edu.in" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="auth-divider"><span>OR</span></div>
          <button className="btn-outline full-width" onClick={seedAndLogin} disabled={loading}>
            🚀 Quick Demo (Admin Login)
          </button>
          <p className="auth-link">Don&apos;t have an account? <Link to="/register">Register here</Link></p>
          <div className="demo-creds">
            <strong>Demo Credentials:</strong><br />
            Email: admin@anurag.edu.in<br />Password: admin123
          </div>
        </div>
      </div>
    </div>
  );
}
