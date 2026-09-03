import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Students() {
  const { accessToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    roll_number: '', date_of_birth: '', phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/students/`, authHeaders);
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.date_of_birth) delete payload.date_of_birth;
      await axios.post(`${API_BASE_URL}/students/`, payload, authHeaders);
      setForm({ username: '', email: '', password: '', roll_number: '', date_of_birth: '', phone: '' });
      fetchStudents();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}/`, authHeaders);
      fetchStudents();
    } catch (err) {
      setError('Failed to delete student.');
    }
  };

  return (
    <PageLayout title="Students" subtitle="Add, view, or remove student accounts">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <h3>Add Student</h3>
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
              <label>Roll Number</label>
              <input name="roll_number" value={form.roll_number} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Date of Birth</label>
              <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 10 }}>
            {submitting ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All Students</h3>
        </div>
        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : students.length === 0 ? (
          <div className="empty-state">No students yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roll Number</th>
                <th>Date of Birth</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.user.username}</td>
                  <td>{s.user.email}</td>
                  <td>{s.roll_number}</td>
                  <td>{s.date_of_birth || '-'}</td>
                  <td>{s.phone}</td>
                  <td>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-danger">Delete</button>
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