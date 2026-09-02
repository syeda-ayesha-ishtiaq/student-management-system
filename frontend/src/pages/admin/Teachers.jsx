import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Teachers() {
  const { accessToken } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    employee_id: '', department: '', phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/teachers/`, authHeaders);
      setTeachers(res.data);
    } catch (err) {
      setError('Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/teachers/`, form, authHeaders);
      setForm({ username: '', email: '', password: '', employee_id: '', department: '', phone: '' });
      fetchTeachers();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/teachers/${id}/`, authHeaders);
      fetchTeachers();
    } catch (err) {
      setError('Failed to delete teacher.');
    }
  };

  return (
    <PageLayout title="Teachers" subtitle="Add, view, or remove teacher accounts">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <h3>Add Teacher</h3>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-grid">
            <div className="form-field">
              <label>Username</label>
              <input name="username" autoComplete="off" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input name="email" type="email" autoComplete="off" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Employee ID</label>
              <input name="employee_id" value={form.employee_id} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 10 }}>
            {submitting ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All Teachers</h3>
        </div>
        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : teachers.length === 0 ? (
          <div className="empty-state">No teachers yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.user.username}</td>
                  <td>{t.user.email}</td>
                  <td>{t.employee_id}</td>
                  <td>{t.department}</td>
                  <td>{t.phone}</td>
                  <td>
                    <button onClick={() => handleDelete(t.id)} className="btn btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}