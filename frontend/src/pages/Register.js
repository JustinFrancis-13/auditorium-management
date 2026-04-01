import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const DEPARTMENTS = ['CSE','ECE','EEE','Mechanical','Civil','MBA','MCA','IT','AI & DS','Pharmacy','Administration','Library','Sports'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',   // FIX: Capital S
    department: 'CSE',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Register button clicked");
    console.log("Form Data:", form);

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      console.log("Register Response:", res.data);

      toast.success('Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.log("Register Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">AU</div>
          <h1>Join the Portal</h1>
          <p>Create your Anurag University account</p>
        </div>
        <div className="auth-features">
          <div className="feature-item">👤 Faculty & Student accounts</div>
          <div className="feature-item">🔐 Secure JWT authentication</div>
          <div className="feature-item">📧 Department-based access</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-in">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Register for Anurag University Auditorium Portal</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  placeholder="10-digit phone"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@anurag.edu.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}