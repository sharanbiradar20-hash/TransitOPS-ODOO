import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { name, role, logout } = useAuth();

  const formatRole = (roleStr) => {
    if (!roleStr) return '';
    return roleStr.replace('_', ' ');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '1.75rem', height: '1.75rem', color: 'var(--accent-color)' }}
          >
            <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
            <path d="M12 2v14.5" />
            <path d="m16 6-4-4-4 4" />
            <path d="M12 16.5c1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5 8.5 11.07 8.5 13s1.57 3.5 3.5 3.5z" />
          </svg>
          Transit<span>Ops</span>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            Dashboard
          </NavLink>

          {/* Vehicles */}
          <NavLink
            to="/vehicles"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h10M19 17h1.5A1.5 1.5 0 0022 15.5V12h-4.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6M9 12h6" />
            </svg>
            Vehicles
          </NavLink>

          {/* Drivers */}
          <NavLink
            to="/drivers"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Drivers
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" title={name}>
            {name || 'Staff User'}
          </div>
          <div className={`role-badge ${role?.toLowerCase().replace('_', '-') || ''}`}>
            {formatRole(role) || 'NO ROLE'}
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{ width: '1.25rem', height: '1.25rem' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
