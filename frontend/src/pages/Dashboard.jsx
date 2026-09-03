import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GRADE_COLORS = {
  'A+': '#16a34a',
  'A': '#22c55e',
  'B': '#2563eb',
  'C': '#d97706',
  'F': '#dc2626',
};

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    let endpoint = '';
    if (user.role === 'ADMIN') endpoint = '/stats/admin/';
    else if (user.role === 'TEACHER') endpoint = '/stats/teacher/';
    else if (user.role === 'STUDENT') endpoint = '/stats/student/';
    else return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    axios
      .get(`${API_BASE_URL}${endpoint}`, { headers })
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load stats.'));

    // Admin only: pull a handful of recently added students for the activity table.
    if (user.role === 'ADMIN') {
      axios
        .get(`${API_BASE_URL}/students/`, { headers })
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data.results || [];
          setRecentStudents(list.slice(-5).reverse());
        })
        .catch(() => {
          /* non-critical — table just stays empty */
        });
    }
  }, [user, accessToken]);

  if (!user) return null;

  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Live statistics and recent activity</p>
          </div>
          <div className="header-pills">
            <span className="pill"><span className="pill-dot" /> System Live</span>
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}

        {user.role === 'ADMIN' && stats && (
          <AdminDashboard stats={stats} recentStudents={recentStudents} />
        )}
        {user.role === 'TEACHER' && stats && <TeacherDashboard user={user} stats={stats} />}
        {user.role === 'STUDENT' && stats && <StudentDashboard user={user} stats={stats} />}
      </main>
    </div>
  );
}

function AdminDashboard({ stats, recentStudents }) {
  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, Admin</h2>
          <p>
            {stats.total_teachers} teachers guiding {stats.total_students} students across{' '}
            {stats.total_courses} courses
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Students" value={stats.total_students} color="blue" />
        <StatCard label="Total Courses" value={stats.total_courses} color="purple" />
        <StatCard label="Total Teachers" value={stats.total_teachers} color="amber" />
        <StatCard
          label="Attendance Rate"
          value={stats.attendance_rate !== null ? `${stats.attendance_rate}%` : '—'}
          color="green"
        />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Recently Registered Students</h3>
          </div>
          {recentStudents.length === 0 ? (
            <div className="empty-state">No students registered yet.</div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.roll_number}</td>
                    <td>{s.user?.username ?? '—'}</td>
                    <td>{s.user?.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Grade Distribution</h3>
            <span style={{ fontSize: 12, color: '#6b7085' }}>
              Avg {stats.average_score !== null ? `${stats.average_score}%` : '—'}
            </span>
          </div>
          {stats.grade_distribution.length === 0 ? (
            <div className="empty-state">No grades recorded yet.</div>
          ) : (
            stats.grade_distribution.map((g) => (
              <div className="grade-row" key={g.label}>
                <span className="grade-dot" style={{ background: GRADE_COLORS[g.label] }} />
                <span className="grade-label">Grade {g.label}</span>
                <div className="grade-bar-track">
                  <div
                    className="grade-bar-fill"
                    style={{ width: `${g.percentage}%`, background: GRADE_COLORS[g.label] }}
                  />
                </div>
                <span className="grade-count">{g.count} ({g.percentage}%)</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function TeacherDashboard({ user, stats }) {
  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user.username}</h2>
          <p>Here's what's happening with your courses</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard label="My Courses" value={stats.total_courses} color="purple" />
        <StatCard label="My Students" value={stats.total_students} color="blue" />
      </div>
    </>
  );
}

function StudentDashboard({ user, stats }) {
  return (
    <>
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {user.username}</h2>
          <p>Here's your academic snapshot</p>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard label="Enrolled Courses" value={stats.total_courses} color="purple" />
        <StatCard
          label="Attendance"
          value={stats.attendance_percentage !== null ? `${stats.attendance_percentage}%` : 'N/A'}
          color="green"
        />
        <StatCard
          label="Average Grade"
          value={stats.average_grade_percentage !== null ? `${stats.average_grade_percentage}%` : 'N/A'}
          color="amber"
        />
      </div>
    </>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: { bg: '#dbeafe', fg: '#2563eb' },
    purple: { bg: '#ede9fe', fg: '#7c3aed' },
    amber: { bg: '#fef3c7', fg: '#d97706' },
    green: { bg: '#dcfce7', fg: '#16a34a' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" style={{ background: c.bg, color: c.fg }}>●</span>
      </div>
      <div className="stat-value">{value ?? '-'}</div>
    </div>
  );
}