import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const STATUS_LABELS = { P: 'Present', A: 'Absent', L: 'Late' };

export default function Attendance() {
  const { courseId } = useParams();
  const { accessToken } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/student/attendance/?course=${courseId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRecords(res.data);
      } catch (err) {
        setError('Failed to load attendance.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [courseId, accessToken]);

  const presentCount = records.filter((r) => r.status === 'P').length;
  const percentage = records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : null;

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <p><Link to="/student/courses">&larr; Back to My Courses</Link></p>
      <h2>My Attendance</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {percentage !== null && (
        <p><strong>Attendance: {percentage}%</strong> ({presentCount} of {records.length} classes present)</p>
      )}

      {records.length === 0 ? (
        <p>No attendance records yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{STATUS_LABELS[r.status] || r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}