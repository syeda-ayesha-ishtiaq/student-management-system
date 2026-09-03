import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Attendance() {
  const { courseId } = useParams();
  const { accessToken } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${accessToken}` } };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/enrollments/?course=${courseId}`, authHeaders);
        setEnrollments(res.data);
        const initialStatus = {};
        res.data.forEach((e) => {
          initialStatus[e.student.id] = 'P';
        });
        setStatusMap(initialStatus);
      } catch (err) {
        setError('Failed to load enrolled students.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [courseId]);

  const handleStatusChange = (studentId, status) => {
    setStatusMap({ ...statusMap, [studentId]: status });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await Promise.all(
        enrollments.map((e) =>
          axios.post(
            `${API_BASE_URL}/attendance/`,
            {
              student_id: e.student.id,
              course_id: courseId,
              date,
              status: statusMap[e.student.id],
            },
            authHeaders
          )
        )
      );
      setSuccess('Attendance saved successfully.');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to save attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="Mark Attendance" subtitle="Record today's attendance for this course">
      <Link to="/teacher/courses" className="panel-link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to My Courses
      </Link>

      <div className="panel">
        <div className="form-field" style={{ maxWidth: 220, marginBottom: 20 }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">No students enrolled in this course yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student</th>
                <th style={{ textAlign: 'center' }}>Present</th>
                <th style={{ textAlign: 'center' }}>Absent</th>
                <th style={{ textAlign: 'center' }}>Late</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.student.id}>
                  <td>{e.student.user.username} ({e.student.roll_number})</td>
                  {['P', 'A', 'L'].map((code) => (
                    <td key={code} style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`status-${e.student.id}`}
                        checked={statusMap[e.student.id] === code}
                        onChange={() => handleStatusChange(e.student.id, code)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 14 }}>{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: 13, marginTop: 14 }}>{success}</p>}

        {enrollments.length > 0 && (
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ marginTop: 16 }}>
            {submitting ? 'Saving...' : 'Save Attendance'}
          </button>
        )}
      </div>
    </PageLayout>
  );
}