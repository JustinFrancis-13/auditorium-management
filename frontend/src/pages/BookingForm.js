import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auditoriumAPI, bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import './BookingForm.css';

const EVENT_TYPES = ['Academic','Cultural','Technical','Sports','Seminar','Conference','Workshop','Convocation','Other'];
const EQUIPMENT = ['Projector','Sound System','LED Screen','Microphones','Live Streaming','Recording Setup','Stage Lighting'];

export default function BookingForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [auditoriums, setAuditoriums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    auditorium: params.get('auditorium') || '',
    eventName: '', eventType: 'Seminar', department: '',
    description: '', expectedAttendees: '',
    startDateTime: '', endDateTime: '',
    requiresEquipment: [], specialRequirements: ''
  });

  useEffect(() => {
    auditoriumAPI.getAll().then(r => setAuditoriums(r.data.data));
  }, []);

  const selectedAud = auditoriums.find(a => a._id === form.auditorium);

  const toggleEquip = (e) => setForm(f => ({
    ...f, requiresEquipment: f.requiresEquipment.includes(e) ? f.requiresEquipment.filter(x => x !== e) : [...f.requiresEquipment, e]
  }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.auditorium) return toast.error('Select an auditorium');
    if (new Date(form.endDateTime) <= new Date(form.startDateTime)) return toast.error('End time must be after start time');
    setLoading(true);
    try {
      const res = await bookingAPI.create(form);
      toast.success('Booking request submitted!');
      navigate(`/bookings/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="booking-form-page fade-in">
      <div className="page-header">
        <div><h1>New Booking Request</h1><p>Fill the form to request an auditorium booking at Anurag University</p></div>
      </div>

      <div className="booking-layout">
        <form className="booking-form-card" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>📍 Venue Selection</h3>
            <div className="form-group">
              <label>Select Auditorium *</label>
              <select value={form.auditorium} onChange={e => setForm({...form, auditorium: e.target.value})} required>
                <option value="">-- Choose Auditorium --</option>
                {auditoriums.map(a => <option key={a._id} value={a._id}>{a.name} (Capacity: {a.capacity})</option>)}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>🗓️ Event Details</h3>
            <div className="form-group">
              <label>Event Name *</label>
              <input placeholder="e.g. Annual Technical Symposium 2024" value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Event Type *</label>
                <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Organizing Department *</label>
                <input placeholder="e.g. CSE" value={form.department} onChange={e => setForm({...form, department: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Describe the event..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Expected Attendees *</label>
              <input type="number" min={1} max={selectedAud?.capacity || 9999} value={form.expectedAttendees}
                onChange={e => setForm({...form, expectedAttendees: e.target.value})} required
                placeholder={selectedAud ? `Max: ${selectedAud.capacity}` : 'Enter count'} />
              {selectedAud && <small style={{color:'var(--text-secondary)'}}>Max capacity: {selectedAud.capacity}</small>}
            </div>
          </div>

          <div className="form-section">
            <h3>⏰ Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input type="datetime-local" value={form.startDateTime} min={new Date().toISOString().slice(0,16)}
                  onChange={e => setForm({...form, startDateTime: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>End Date & Time *</label>
                <input type="datetime-local" value={form.endDateTime} min={form.startDateTime}
                  onChange={e => setForm({...form, endDateTime: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>🔧 Equipment Requirements</h3>
            <div className="equip-grid">
              {EQUIPMENT.map(e => (
                <label key={e} className={`equip-card ${form.requiresEquipment.includes(e) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={form.requiresEquipment.includes(e)} onChange={() => toggleEquip(e)} />
                  <span>{e}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>📝 Special Requirements</h3>
            <div className="form-group">
              <textarea rows={3} placeholder="Any specific setup, decoration, or other requirements..." value={form.specialRequirements} onChange={e => setForm({...form, specialRequirements: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn-primary full-submit" disabled={loading}>
            {loading ? 'Submitting...' : '📤 Submit Booking Request'}
          </button>
        </form>

        <div className="booking-sidebar">
          {selectedAud ? (
            <div className="venue-preview-card">
              <div className="preview-header">
                <h3>{selectedAud.name}</h3>
                <span className="venue-code">{selectedAud.code}</span>
              </div>
              <div className="preview-info">
                <div className="preview-item"><strong>Location:</strong> {selectedAud.location}</div>
                <div className="preview-item"><strong>Capacity:</strong> {selectedAud.capacity.toLocaleString()} people</div>
              </div>
              <div className="amenities-list" style={{marginTop:12}}>
                {selectedAud.amenities?.map(a => <span key={a} className="amenity-tag">{a}</span>)}
              </div>
            </div>
          ) : (
            <div className="select-prompt">👈 Select an auditorium to see details</div>
          )}

          <div className="booking-notes">
            <h4>📋 Booking Guidelines</h4>
            <ul>
              <li>Submit request at least 3 days in advance</li>
              <li>Approval takes 1-2 business days</li>
              <li>Cancellations must be made 24hrs before</li>
              <li>All equipment must be requested in advance</li>
              <li>Unauthorized use will result in action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
