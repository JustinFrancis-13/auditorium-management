import React, { useEffect, useState } from 'react';
import { auditoriumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Users, MapPin, Plus, Wrench } from 'lucide-react';
import './Page.css';

const AMENITY_ICONS = { 'AC': '❄️', 'Projector': '📽️', 'Sound System': '🔊', 'LED Screen': '🖥️', 'Green Room': '🚪', 'Stage Lighting': '💡', 'Microphones': '🎤', 'Live Streaming': '📡', 'Recording Setup': '🎬', 'Parking': '🅿️' };

export default function Auditoriums() {
  const { user } = useAuth();
  const [auditoriums, setAuditoriums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name:'', code:'', location:'', capacity:'', description:'', amenities:[], pricePerHour:0 });

  useEffect(() => { fetchAuditoriums(); }, []);

  const fetchAuditoriums = async () => {
    try {
      const res = await auditoriumAPI.getAll();
      setAuditoriums(res.data.data);
    } finally { setLoading(false); }
  };

  const handleSeed = async () => {
    try {
      await auditoriumAPI.seed();
      toast.success('Auditoriums seeded!');
      fetchAuditoriums();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await auditoriumAPI.create(form);
      toast.success('Auditorium added!');
      setShowAddModal(false);
      fetchAuditoriums();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const toggleAmenity = (a) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const ALL_AMENITIES = ['AC','Projector','Sound System','LED Screen','Green Room','Stage Lighting','Microphones','Live Streaming','Recording Setup','Parking'];

  if (loading) return <div className="loading-state">Loading auditoriums...</div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div><h1>Auditoriums</h1><p>Available venues at Anurag University</p></div>
        {user?.role === 'admin' && (
          <div style={{display:'flex',gap:10}}>
            <button className="btn-outline" onClick={handleSeed}><Wrench size={16}/> Seed Data</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16}/> Add Auditorium</button>
          </div>
        )}
      </div>

      {auditoriums.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <h3>No Auditoriums Found</h3>
          <p>Add auditoriums or use the seed button to load demo data</p>
          {user?.role === 'admin' && <button className="btn-primary" onClick={handleSeed}>Seed Demo Data</button>}
        </div>
      ) : (
        <div className="cards-grid">
          {auditoriums.map(a => (
            <div key={a._id} className="venue-card">
              <div className="venue-header">
                <div className="venue-icon"><Building2 size={28} /></div>
                <span className="venue-code">{a.code}</span>
              </div>
              <h3 className="venue-name">{a.name}</h3>
              <div className="venue-meta">
                <span><MapPin size={14}/> {a.location}</span>
                <span><Users size={14}/> Capacity: {a.capacity.toLocaleString()}</span>
              </div>
              <p className="venue-desc">{a.description}</p>
              <div className="amenities-list">
                {a.amenities?.slice(0,6).map(am => (
                  <span key={am} className="amenity-tag" title={am}>{AMENITY_ICONS[am] || '✓'} {am}</span>
                ))}
                {a.amenities?.length > 6 && <span className="amenity-tag">+{a.amenities.length - 6} more</span>}
              </div>
              <Link to={`/bookings/new?auditorium=${a._id}`} className="btn-primary" style={{display:'block',textAlign:'center',marginTop:'auto'}}>
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Auditorium</h2>
            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></div>
                <div className="form-group"><label>Code</label><input placeholder="AUD-004" value={form.code} onChange={e => setForm({...form,code:e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form,location:e.target.value})} required /></div>
                <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form,capacity:e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
              <div className="form-group"><label>Amenities</label>
                <div className="amenity-checkboxes">
                  {ALL_AMENITIES.map(a => (
                    <label key={a} className="check-label">
                      <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} /> {a}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Auditorium</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
