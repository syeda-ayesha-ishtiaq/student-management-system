import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function MyCourses() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/my-courses/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [accessToken]);

  return (
    <PageLayout title="My Courses" subtitle="Courses you're currently teaching">
      <div className="panel">
        {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {loading ? (
          <p style={{ color: '#6b7085', fontSize: 13 }}>Loading...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">You have no courses assigned yet.</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td>
                    <Link to={`/teacher/courses/${c.id}/attendance`} className="panel-link">
                      Attendance
                    </Link>
                    {' · '}
                    <Link to={`/teacher/courses/${c.id}/grades`} className="panel-link">
                      Grades
                    </Link>
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