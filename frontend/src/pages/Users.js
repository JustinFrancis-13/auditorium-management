import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Page.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    userAPI.getAll().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await userAPI.toggleStatus(id);
      setUsers(u => u.map(user => user._id === id ? res.data.data : user));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const handleRole = async (id, role) => {
    try {
      const res = await userAPI.updateRole(id, role);
      setUsers(u => u.map(user => user._id === id ? res.data.data : user));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loading-state">Loading users...</div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div><h1>Users Management</h1><p>Manage all registered users</p></div>
        <div style={{background:'#e8f0fe',padding:'8px 16px',borderRadius:10,fontSize:14,color:'var(--primary)',fontWeight:600}}>
          👥 {users.length} Total Users
        </div>
      </div>

      <div className="filter-bar">
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{minWidth:240}} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:36,height:36,background:'var(--primary)',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div><strong>{u.name}</strong><br/><small style={{color:'var(--text-secondary)'}}>{u.email}</small></div>
                  </div>
                </td>
                <td>
                  <select value={u.role} onChange={e => handleRole(u._id, e.target.value)} style={{padding:'5px 10px',border:'1.5px solid var(--border)',borderRadius:8,fontSize:13,background:'var(--bg)'}}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.department}</td>
                <td><small>{u.phone || '—'}</small></td>
                <td><span style={{padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:u.isActive?'#e8f5e9':'#ffebee',color:u.isActive?'#2e7d32':'#c62828'}}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className={u.isActive ? 'btn-danger' : 'btn-primary'} style={{padding:'6px 14px',fontSize:12,background:u.isActive?'var(--accent)':'var(--success)'}} onClick={() => handleToggle(u._id)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-secondary)'}}>No users found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
