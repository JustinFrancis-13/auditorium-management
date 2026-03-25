import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './BookingDetail.css';

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    bookingAPI.getOne(id).then(r => setBooking(r.data.data)).catch(() => navigate('/bookings/my')).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    try {
      await bookingAPI.updateStatus(id, { status: 'approved' });
      toast.success('Booking approved!');
      setBooking(b => ({...b, status: 'approved'}));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async () => {
    try {
      await bookingAPI.updateStatus(id, { status: 'rejected', rejectionReason: reason });
      toast.success('Booking rejected');
      setShowReject(false);
      setBooking(b => ({...b, status: 'rejected', rejectionReason: reason}));
    } catch (err) { toast.error('Failed'); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled');
      setBooking(b => ({...b, status: 'cancelled'}));
    } catch (err) { toast.error('Failed'); }
  };

  const handleFeedback = async () => {
    try {
      await bookingAPI.feedback(id, feedback);
      toast.success('Feedback submitted!');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-state">Loading booking details...</div>;
  if (!booking) return null;

  const isAdmin = ['admin','staff'].includes(user?.role);
  const isOwner = booking.requestedBy?._id === user?._id || booking.requestedBy === user?._id;

  return (
    <div className="booking-detail fade-in">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="detail-id">
          <h1>{booking.eventName}</h1>
          <span className="booking-id-badge">{booking.bookingId}</span>
          <span className={`badge badge-${booking.status}`}>{booking.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-card">
            <h3>📅 Event Information</h3>
            <div className="info-grid">
              <div className="info-item"><label>Event Type</label><span>{booking.eventType}</span></div>
              <div className="info-item"><label>Department</label><span>{booking.department}</span></div>
              <div className="info-item"><label>Expected Attendees</label><span>{booking.expectedAttendees}</span></div>
              <div className="info-item"><label>Start Time</label><span>{format(new Date(booking.startDateTime), 'dd MMM yyyy, hh:mm a')}</span></div>
              <div className="info-item"><label>End Time</label><span>{format(new Date(booking.endDateTime), 'dd MMM yyyy, hh:mm a')}</span></div>
            </div>
            {booking.description && <div style={{marginTop:14}}><label style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)',display:'block',marginBottom:4}}>Description</label><p style={{fontSize:14,lineHeight:1.6}}>{booking.description}</p></div>}
          </div>

          <div className="detail-card">
            <h3>🏛️ Venue Details</h3>
            <div className="info-grid">
              <div className="info-item"><label>Auditorium</label><span>{booking.auditorium?.name}</span></div>
              <div className="info-item"><label>Code</label><span>{booking.auditorium?.code}</span></div>
              <div className="info-item"><label>Location</label><span>{booking.auditorium?.location}</span></div>
              <div className="info-item"><label>Total Capacity</label><span>{booking.auditorium?.capacity}</span></div>
            </div>
          </div>

          {booking.requiresEquipment?.length > 0 && (
            <div className="detail-card">
              <h3>🔧 Equipment Requested</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                {booking.requiresEquipment.map(e => <span key={e} className="amenity-tag">{e}</span>)}
              </div>
            </div>
          )}

          {booking.status === 'rejected' && booking.rejectionReason && (
            <div className="detail-card" style={{borderLeft:'4px solid var(--accent)'}}>
              <h3>❌ Rejection Reason</h3>
              <p style={{color:'var(--accent)',marginTop:8}}>{booking.rejectionReason}</p>
            </div>
          )}

          {booking.status === 'completed' && !booking.feedback?.rating && isOwner && (
            <div className="detail-card">
              <h3>⭐ Submit Feedback</h3>
              <div className="form-group" style={{marginTop:12}}>
                <label>Rating</label>
                <div style={{display:'flex',gap:8}}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setFeedback(f => ({...f,rating:n}))}
                      style={{fontSize:24,background:'none',border:'none',cursor:'pointer',color:feedback.rating>=n?'var(--gold)':'#ccc'}}>★</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea rows={3} value={feedback.comment} onChange={e => setFeedback(f => ({...f,comment:e.target.value}))} placeholder="Share your experience..." style={{width:'100%',padding:'10px',border:'1.5px solid var(--border)',borderRadius:8,fontFamily:'inherit'}} />
              </div>
              <button className="btn-primary" onClick={handleFeedback}>Submit Feedback</button>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="detail-card">
            <h3>👤 Requested By</h3>
            <div className="requester-info">
              <div className="requester-avatar">{booking.requestedBy?.name?.charAt(0)}</div>
              <div><strong>{booking.requestedBy?.name}</strong><br/><small>{booking.requestedBy?.email}</small><br/><small>{booking.requestedBy?.department} • {booking.requestedBy?.role}</small></div>
            </div>
          </div>

          <div className="detail-card">
            <h3>📋 Booking Timeline</h3>
            <div className="timeline">
              <div className="timeline-item done"><span>Submitted</span><small>{format(new Date(booking.createdAt), 'dd MMM, hh:mm a')}</small></div>
              <div className={`timeline-item ${['approved','rejected','completed'].includes(booking.status) ? 'done' : 'pending'}`}>
                <span>Review</span><small>{booking.approvedAt ? format(new Date(booking.approvedAt), 'dd MMM, hh:mm a') : 'Pending'}</small>
              </div>
              <div className={`timeline-item ${booking.status === 'approved' || booking.status === 'completed' ? 'done' : ''}`}>
                <span>Approved</span><small>{booking.approvedBy?.name || '—'}</small>
              </div>
              <div className={`timeline-item ${booking.status === 'completed' ? 'done' : ''}`}>
                <span>Completed</span><small>—</small>
              </div>
            </div>
          </div>

          {(isAdmin || (isOwner && booking.status === 'pending')) && (
            <div className="detail-card">
              <h3>⚡ Actions</h3>
              <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:12}}>
                {isAdmin && booking.status === 'pending' && (
                  <>
                    <button className="btn-primary" style={{background:'var(--success)'}} onClick={handleApprove}>✓ Approve Booking</button>
                    <button className="btn-danger" onClick={() => setShowReject(true)}>✗ Reject Booking</button>
                  </>
                )}
                {(isOwner || isAdmin) && ['pending','approved'].includes(booking.status) && (
                  <button className="btn-outline" onClick={handleCancel}>Cancel Booking</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReject && (
        <div className="modal-overlay" onClick={() => setShowReject(false)}>
          <div className="modal" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
            <h2>Reject Booking</h2>
            <div className="form-group" style={{marginTop:12}}>
              <label>Reason *</label>
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} style={{width:'100%',padding:'10px',border:'1.5px solid var(--border)',borderRadius:8,fontFamily:'inherit'}} />
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn-outline" onClick={() => setShowReject(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleReject} disabled={!reason}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
