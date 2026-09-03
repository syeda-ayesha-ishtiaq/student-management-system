import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Grades() {
  const { courseId } = useParams();
  const { accessToken } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/student/grades/?course=${courseId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setRecords(res.data);
      } catch (err) {
        setError('Failed to load grades.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [courseId, accessToken]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <p><Link to="/student/courses">&larr; Back to My Courses</Link></p>
      <h2>My Grades</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {records.length === 0 ? (
        <p>No grades recorded yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Exam Type</th>
              <th>Marks Obtained</th>
              <th>Max Marks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.exam_type}</td>
                <td>{r.marks_obtained}</td>
                <td>{r.max_marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}