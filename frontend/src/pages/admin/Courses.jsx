import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Courses() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', code: '', teacher_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses/`, authHeaders),
        axios.get(`${API_BASE_URL}/teachers/`, authHeaders),
      ]);
      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { name: form.name, code: form.code };
      if (form.teacher_id) payload.teacher_id = form.teacher_id;
      await axios.post(`${API_BASE_URL}/courses/`, payload, authHeaders);
      setForm({ name: '', code: '', teacher_id: '' });
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/courses/${id}/`, authHeaders);
      fetchData();
    } catch (err) {
      setError('Failed to delete course.');
    }
  };

  return (
    <PageLayout title="Courses" subtitle="Add, view, or remove courses">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <h3>Add Course</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Course Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Course Code</label>
              <input name="code" value={form.code} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Teacher</label>
              <select name="teacher_id" value={form.teacher_id} onChange={handleChange}>
                <option value="">-- No teacher assigned --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.username} ({t.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 10 }}>
            {submitting ? 'Adding...' : 'Add Course'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All Courses</h3>
        </div>
        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">No courses yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Teacher</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td>{c.teacher ? c.teacher.user.username : 'Unassigned'}</td>
                  <td>
                    <button onClick={() => handleDelete(c.id)} className="btn btn-danger">Delete</button>
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