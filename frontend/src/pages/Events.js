import React, { useEffect, useState } from 'react';
import { eventAPI, auditoriumAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, Users, Plus } from 'lucide-react';
import './Page.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [auditoriums, setAuditoriums] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', auditorium:'', eventType:'Seminar', startDateTime:'', endDateTime:'', isPublic:true, registrationRequired:false, maxRegistrations:'' });

  useEffect(() => {
    Promise.all([eventAPI.getAll(), auditoriumAPI.getAll()])
      .then(([e, a]) => { setEvents(e.data.data); setAuditoriums(a.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (ev) => {
    ev.preventDefault();
    try {
      const res = await eventAPI.create(form);
      setEvents(prev => [res.data.data, ...prev]);
      toast.success('Event created!');
      setShowAdd(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRegister = async (id) => {
    try {
      await eventAPI.register(id);
      toast.success('Registered for event!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-state">Loading events...</div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div><h1>Events</h1><p>Upcoming events at Anurag University</p></div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16}/> Create Event</button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state"><CalendarDays size={48}/><h3>No Events Yet</h3><p>Create an event to get started</p></div>
      ) : (
        <div className="cards-grid">
          {events.map(e => (
            <div key={e._id} className="event-card">
              <div className="event-card-header">
                <span className="event-type-badge">{e.eventType || 'Event'}</span>
                <span className={`badge badge-${e.status}`}>{e.status}</span>
              </div>
              <h3>{e.title}</h3>
              <p className="event-desc">{e.description}</p>
              <div className="event-details">
                <div><CalendarDays size={14}/> {format(new Date(e.startDateTime), 'dd MMM yyyy, hh:mm a')}</div>
                <div><MapPin size={14}/> {e.auditorium?.name}</div>
                <div><Users size={14}/> {e.registrations?.length || 0} registered</div>
              </div>
              {e.registrationRequired && e.status === 'upcoming' && (
                <button className="btn-primary" style={{width:'100%',marginTop:'auto'}} onClick={() => handleRegister(e._id)}>
                  Register Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={ev => ev.stopPropagation()}>
            <h2>Create New Event</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Event Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} required placeholder="Event title..." /></div>
              <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Auditorium</label>
                  <select value={form.auditorium} onChange={e => setForm({...form,auditorium:e.target.value})}>
                    <option value="">Select...</option>
                    {auditoriums.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Event Type</label>
                  <select value={form.eventType} onChange={e => setForm({...form,eventType:e.target.value})}>
                    {['Academic','Cultural','Technical','Sports','Seminar','Conference','Workshop','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Start</label><input type="datetime-local" value={form.startDateTime} onChange={e => setForm({...form,startDateTime:e.target.value})} required /></div>
                <div className="form-group"><label>End</label><input type="datetime-local" value={form.endDateTime} onChange={e => setForm({...form,endDateTime:e.target.value})} required /></div>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
                <button type="button" className="btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
