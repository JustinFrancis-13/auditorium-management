import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Page.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.data);
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleAction = async (action) => {
    try {
      await bookingAPI.updateStatus(actionModal._id, {
        status: action,
        rejectionReason: action === 'rejected' ? reason : undefined,
        cancellationReason: action === 'cancelled' ? reason : undefined
      });
      toast.success(`Booking ${action}!`);
      setActionModal(null);
      setReason('');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div><h1>Manage Bookings</h1><p>Review and approve booking requests</p></div>
        <div style={{background:'#fff8e1',padding:'8px 16px',borderRadius:10,fontSize:14,color:'#f9a825',fontWeight:600}}>
          ⏳ {bookings.filter(b=>b.status==='pending').length} Pending
        </div>
      </div>

      <div className="filter-bar">
        {['all','pending','approved','rejected','cancelled'].map(s => (
          <button key={s} className={filter === s ? 'btn-primary' : 'btn-outline'} style={{padding:'8px 16px',fontSize:'13px'}} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? bookings.length : bookings.filter(b=>b.status===s).length})
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Booking ID</th><th>Event</th><th>Requested By</th><th>Auditorium</th><th>Date</th><th>Attendees</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id}>
                <td style={{fontWeight:600,color:'var(--primary)'}}>{b.bookingId}</td>
                <td><strong>{b.eventName}</strong><br/><small style={{color:'var(--text-secondary)'}}>{b.eventType}</small></td>
                <td>{b.requestedBy?.name}<br/><small style={{color:'var(--text-secondary)'}}>{b.requestedBy?.department} • {b.requestedBy?.role}</small></td>
                <td>{b.auditorium?.name}</td>
                <td>{format(new Date(b.startDateTime),'dd MMM yyyy')}<br/><small>{format(new Date(b.startDateTime),'hh:mm a')}</small></td>
                <td>{b.expectedAttendees}</td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <Link to={`/bookings/${b._id}`} className="btn-outline" style={{padding:'5px 10px',fontSize:'12px'}}>View</Link>
                    {b.status === 'pending' && (
                      <>
                        <button className="btn-success" style={{padding:'5px 10px',fontSize:'12px'}} onClick={() => handleAction('approved') || setActionModal(b)}>
                        </button>
                        <button className="btn-primary" style={{padding:'5px 10px',fontSize:'12px',background:'var(--success)'}} onClick={() => { setActionModal(b); setReason(''); handleAction('approved'); }}>✓ Approve</button>
                        <button className="btn-danger" style={{padding:'5px 10px',fontSize:'12px'}} onClick={() => setActionModal({...b, pendingAction:'rejected'})}>✗ Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'40px',color:'var(--text-secondary)'}}>No bookings found</td></tr>}
          </tbody>
        </table>
      </div>

      {actionModal?.pendingAction && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" style={{maxWidth:440}} onClick={e => e.stopPropagation()}>
            <h2>Reject Booking</h2>
            <p style={{color:'var(--text-secondary)',marginBottom:16}}>Booking: <strong>{actionModal.bookingId}</strong> - {actionModal.eventName}</p>
            <div className="form-group">
              <label>Reason for Rejection *</label>
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide reason for rejection..." />
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn-outline" onClick={() => setActionModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleAction('rejected')} disabled={!reason}>Reject Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
