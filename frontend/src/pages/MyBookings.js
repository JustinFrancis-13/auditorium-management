import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';
import './Page.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.data);
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="loading-state">Loading bookings...</div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div><h1>My Bookings</h1><p>Track all your auditorium booking requests</p></div>
        <Link to="/bookings/new" className="btn-primary">+ New Booking</Link>
      </div>

      <div className="filter-bar">
        {['all','pending','approved','rejected','cancelled','completed'].map(s => (
          <button key={s} className={filter === s ? 'btn-primary' : 'btn-outline'} style={{padding:'8px 16px',fontSize:'13px'}} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{marginLeft:6,background:'rgba(255,255,255,0.25)',padding:'1px 6px',borderRadius:10,fontSize:11}}>
              {s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>Create a new booking request to get started</p>
          <Link to="/bookings/new" className="btn-primary">Create Booking</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Booking ID</th><th>Event Name</th><th>Auditorium</th><th>Date & Time</th><th>Attendees</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td style={{fontWeight:600,color:'var(--primary)'}}>{b.bookingId}</td>
                  <td>
                    <strong>{b.eventName}</strong>
                    <br/><small style={{color:'var(--text-secondary)'}}>{b.eventType} • {b.department}</small>
                  </td>
                  <td>{b.auditorium?.name}<br/><small style={{color:'var(--text-secondary)'}}>{b.auditorium?.location}</small></td>
                  <td>
                    {format(new Date(b.startDateTime), 'dd MMM yyyy')}<br/>
                    <small style={{color:'var(--text-secondary)'}}>
                      {format(new Date(b.startDateTime), 'hh:mm a')} - {format(new Date(b.endDateTime), 'hh:mm a')}
                    </small>
                  </td>
                  <td>{b.expectedAttendees}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td><Link to={`/bookings/${b._id}`} className="btn-outline" style={{padding:'6px 14px',fontSize:'13px'}}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
