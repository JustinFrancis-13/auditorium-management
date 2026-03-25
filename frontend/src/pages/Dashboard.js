import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, CalendarCheck, Clock, Users, TrendingUp, CalendarDays } from 'lucide-react';
import './Dashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { pending: '#f9a825', approved: '#2e7d32', rejected: '#c62828', cancelled: '#757575', completed: '#0277bd' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(s => { setStats(s.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  const isAdmin = ['admin','staff'].includes(user?.role);

  const StatCard = ({ icon, label, value, color, sub }) => (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );

  StatCard.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    color: PropTypes.string.isRequired,
    sub: PropTypes.string
  };

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Anurag University Auditorium Management System</p>
        </div>
        <Link to="/bookings/new" className="btn-primary">+ New Booking</Link>
      </div>

      {isAdmin ? (
        <>
          <div className="stats-grid">
            <StatCard icon={<CalendarCheck size={24}/>} label="Total Bookings" value={stats?.totalBookings || 0} color="#1a237e" />
            <StatCard icon={<Clock size={24}/>} label="Pending Approval" value={stats?.pendingBookings || 0} color="#f9a825" sub="Needs attention" />
            <StatCard icon={<CalendarDays size={24}/>} label="Upcoming Events" value={stats?.approvedBookings || 0} color="#2e7d32" />
            <StatCard icon={<Users size={24}/>} label="Total Users" value={stats?.totalUsers || 0} color="#0277bd" />
            <StatCard icon={<Building2 size={24}/>} label="Auditoriums" value={stats?.totalAuditoriums || 0} color="#6a1b9a" />
            <StatCard icon={<TrendingUp size={24}/>} label="This Month" value={stats?.monthlyBookings || 0} color="#e53935" sub="Bookings" />
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <h3>Bookings Last 6 Months</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(stats?.last6Months || []).map(m => ({ name: MONTHS[m._id.month-1], count: m.count }))}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a237e" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Bookings by Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={(stats?.bookingsByStatus || []).map(s => ({ name: s._id, value: s.count }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {(stats?.bookingsByStatus || []).map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s._id] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Recent Bookings</h3>
              <Link to="/bookings/admin">View All</Link>
            </div>
            <table className="data-table">
              <thead><tr><th>Booking ID</th><th>Event</th><th>Auditorium</th><th>Requested By</th><th>Status</th></tr></thead>
              <tbody>
                {(stats?.recentBookings || []).map(b => (
                  <tr key={b._id}>
                    <td><Link to={`/bookings/${b._id}`} style={{color:'var(--primary)',fontWeight:600}}>{b.bookingId}</Link></td>
                    <td>{b.eventName}</td>
                    <td>{b.auditorium?.name}</td>
                    <td>{b.requestedBy?.name}<br/><small style={{color:'var(--text-secondary)'}}>{b.requestedBy?.department}</small></td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard icon={<CalendarCheck size={24}/>} label="My Total Bookings" value={stats?.myBookings || 0} color="#1a237e" />
            <StatCard icon={<Clock size={24}/>} label="Pending Bookings" value={stats?.myPendingBookings || 0} color="#f9a825" />
            <StatCard icon={<CalendarDays size={24}/>} label="Upcoming Events" value={stats?.myApprovedBookings || 0} color="#2e7d32" />
          </div>
          <div className="two-col">
            <div className="table-card">
              <div className="table-header"><h3>My Recent Bookings</h3><Link to="/bookings/my">View All</Link></div>
              <table className="data-table">
                <thead><tr><th>Event</th><th>Venue</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {(stats?.myRecentBookings || []).map(b => (
                    <tr key={b._id}>
                      <td><Link to={`/bookings/${b._id}`} style={{color:'var(--primary)',fontWeight:600}}>{b.eventName}</Link></td>
                      <td>{b.auditorium?.name}</td>
                      <td>{new Date(b.startDateTime).toLocaleDateString()}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-card">
              <div className="table-header"><h3>Upcoming Events</h3><Link to="/events">View All</Link></div>
              <div className="events-list">
                {(stats?.upcomingEvents || []).map(e => (
                  <div key={e._id} className="event-item">
                    <div className="event-date">{new Date(e.startDateTime).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}</div>
                    <div className="event-info"><strong>{e.title}</strong><span>{e.auditorium?.name}</span></div>
                  </div>
                ))}
                {(stats?.upcomingEvents || []).length === 0 && <p style={{color:'var(--text-secondary)',padding:'16px',textAlign:'center'}}>No upcoming events</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
