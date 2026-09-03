import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Enrollments() {
  const { accessToken } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ student_id: '', course_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [enrollRes, studentsRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/enrollments/`, authHeaders),
        axios.get(`${API_BASE_URL}/students/`, authHeaders),
        axios.get(`${API_BASE_URL}/courses/`, authHeaders),
      ]);
      setEnrollments(enrollRes.data);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      setError('Failed to load enrollments.');
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
      await axios.post(`${API_BASE_URL}/enrollments/`, form, authHeaders);
      setForm({ student_id: '', course_id: '' });
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to create enrollment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this enrollment?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/enrollments/${id}/`, authHeaders);
      fetchData();
    } catch (err) {
      setError('Failed to remove enrollment.');
    }
  };

  return (
    <PageLayout title="Enrollments" subtitle="Enroll students into courses">
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <h3>Enroll a Student</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Student</label>
              <select name="student_id" value={form.student_id} onChange={handleChange} required>
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user.username} ({s.roll_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Course</label>
              <select name="course_id" value={form.course_id} onChange={handleChange} required>
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 10 }}>
            {submitting ? 'Enrolling...' : 'Enroll'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All Enrollments</h3>
        </div>
        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">No enrollments yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Enrolled On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>{e.student.user.username} ({e.student.roll_number})</td>
                  <td>{e.course.name} ({e.course.code})</td>
                  <td>{e.enrolled_on}</td>
                  <td>
                    <button onClick={() => handleDelete(e.id)} className="btn btn-danger">Remove</button>
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