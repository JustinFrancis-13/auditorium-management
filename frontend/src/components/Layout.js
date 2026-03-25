import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, CalendarPlus, CalendarCheck, ListChecks,
  CalendarDays, Users, UserCircle, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/auditoriums', icon: <Building2 size={20} />, label: 'Auditoriums' },
    { to: '/bookings/new', icon: <CalendarPlus size={20} />, label: 'New Booking' },
    { to: '/bookings/my', icon: <CalendarCheck size={20} />, label: 'My Bookings' },
    ...( ['admin','staff'].includes(user?.role) ? [{ to: '/bookings/admin', icon: <ListChecks size={20} />, label: 'Manage Bookings' }] : [] ),
    { to: '/events', icon: <CalendarDays size={20} />, label: 'Events' },
    ...( user?.role === 'admin' ? [{ to: '/users', icon: <Users size={20} />, label: 'Users' }] : [] ),
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">AU</div>
            {sidebarOpen && <div className="logo-text"><span className="logo-title">Anurag University</span><span className="logo-sub">Auditorium System</span></div>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title={!sidebarOpen ? item.label : ''}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="nav-item" title={!sidebarOpen ? 'Profile' : ''}>
            <span className="nav-icon"><UserCircle size={20} /></span>
            {sidebarOpen && <span className="nav-label">Profile</span>}
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
            <span className="nav-icon"><LogOut size={20} /></span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-container">
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="page-greeting">Welcome, {user?.name?.split(' ')[0]} 👋</h2>
            <span className="role-badge">{user?.role}</span>
          </div>
          <div className="topbar-right">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="user-name">{user?.name}</span>
              <ChevronDown size={16} />
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</NavLink>
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
