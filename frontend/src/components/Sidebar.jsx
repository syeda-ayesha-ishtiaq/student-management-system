import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Small inline icons (no extra dependency needed) ---
const Icon = {
  Dashboard: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Teachers: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Students: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Courses: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
  Enrollments: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" /><path d="m9 14 2 2 4-4" />
    </svg>
  ),
  Logout: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  ),
};

const NAV_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', to: '/dashboard', icon: Icon.Dashboard },
    { label: 'Teachers', to: '/admin/teachers', icon: Icon.Teachers },
    { label: 'Students', to: '/admin/students', icon: Icon.Students },
    { label: 'Courses', to: '/admin/courses', icon: Icon.Courses },
    { label: 'Enrollments', to: '/admin/enrollments', icon: Icon.Enrollments },
  ],
  TEACHER: [
    { label: 'Dashboard', to: '/dashboard', icon: Icon.Dashboard },
    { label: 'My Courses', to: '/teacher/courses', icon: Icon.Courses },
  ],
  STUDENT: [
    { label: 'Dashboard', to: '/dashboard', icon: Icon.Dashboard },
    { label: 'My Courses', to: '/student/courses', icon: Icon.Courses },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navItems = NAV_BY_ROLE[user?.role] || [];
  const initial = user?.username ? user.username[0].toUpperCase() : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">SM</div>
        <div className="sidebar-logo-text">
          <div className="title">StudentMS</div>
          <div className="subtitle">MANAGEMENT SYSTEM</div>
        </div>
      </div>

      <div className="sidebar-section-label">MAIN NAVIGATION</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initial}</div>
        <div>
          <div className="sidebar-user-name">{user?.username}</div>
          <div className="sidebar-user-role">{user?.role}</div>
        </div>
        <button className="sidebar-logout" onClick={logout} title="Logout">
          <Icon.Logout />
        </button>
      </div>
    </aside>
  );
}