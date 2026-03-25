import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { UserCircle, Lock } from 'lucide-react';
import './Page.css';

const DEPARTMENTS = ['CSE','ECE','EEE','Mechanical','Civil','MBA','MCA','IT','AI & DS','Pharmacy','Administration','Library','Sports'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match");
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page fade-in" style={{maxWidth:800}}>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Manage your account settings</p></div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{background:'var(--card)',borderRadius:'var(--radius)',padding:24,boxShadow:'var(--shadow)',display:'flex',alignItems:'center',gap:20}}>
          <div style={{width:72,height:72,background:'var(--primary)',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700}}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:22}}>{user?.name}</h2>
            <p style={{color:'var(--text-secondary)',fontSize:14}}>{user?.email}</p>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <span style={{background:'var(--primary)',color:'#fff',padding:'3px 12px',borderRadius:20,fontSize:12,textTransform:'capitalize'}}>{user?.role}</span>
              <span style={{background:'var(--bg)',color:'var(--text-secondary)',padding:'3px 12px',borderRadius:20,fontSize:12,border:'1px solid var(--border)'}}>{user?.department}</span>
            </div>
          </div>
        </div>

        <div style={{background:'var(--card)',borderRadius:'var(--radius)',padding:24,boxShadow:'var(--shadow)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <UserCircle size={20} color="var(--primary)"/>
            <h3 style={{fontFamily:'Playfair Display,serif',fontSize:16}}>Update Profile</h3>
          </div>
          <form onSubmit={handleProfile}>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required /></div>
              <div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="10-digit number" /></div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={form.department} onChange={e => setForm({...form,department:e.target.value})}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        <div style={{background:'var(--card)',borderRadius:'var(--radius)',padding:24,boxShadow:'var(--shadow)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <Lock size={20} color="var(--primary)"/>
            <h3 style={{fontFamily:'Playfair Display,serif',fontSize:16}}>Change Password</h3>
          </div>
          <form onSubmit={handlePassword}>
            <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm,currentPassword:e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm,newPassword:e.target.value})} required minLength={6} /></div>
              <div className="form-group"><label>Confirm Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm,confirm:e.target.value})} required minLength={6} /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
