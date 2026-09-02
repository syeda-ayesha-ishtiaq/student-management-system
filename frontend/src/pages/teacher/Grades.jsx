import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function Grades() {
  const { courseId } = useParams();
  const { accessToken } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [examType, setExamType] = useState('Final');
  const [maxMarks, setMaxMarks] = useState('100');
  const [marksMap, setMarksMap] = useState({});
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
      } catch (err) {
        setError('Failed to load enrolled students.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [courseId]);

  const handleMarksChange = (studentId, value) => {
    setMarksMap({ ...marksMap, [studentId]: value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    const missing = enrollments.some((e) => !marksMap[e.student.id]);
    if (missing) {
      setError('Please enter marks for every student before saving.');
      setSubmitting(false);
      return;
    }

    try {
      await Promise.all(
        enrollments.map((e) =>
          axios.post(
            `${API_BASE_URL}/academic-records/`,
            {
              student_id: e.student.id,
              course_id: courseId,
              exam_type: examType,
              marks_obtained: marksMap[e.student.id],
              max_marks: maxMarks,
            },
            authHeaders
          )
        )
      );
      setSuccess('Grades saved successfully.');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : 'Failed to save grades.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="Enter Grades" subtitle="Record exam marks for this course">
      <Link to="/teacher/courses" className="panel-link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to My Courses
      </Link>

      <div className="panel">
        <div className="form-grid" style={{ maxWidth: 400 }}>
          <div className="form-field">
            <label>Exam Type</label>
            <input
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g. Midterm, Final"
            />
          </div>
          <div className="form-field">
            <label>Max Marks</label>
            <input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
            />
          </div>
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
                <th>Marks Obtained</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.student.id}>
                  <td>{e.student.user.username} ({e.student.roll_number})</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={maxMarks}
                      step="0.01"
                      value={marksMap[e.student.id] || ''}
                      onChange={(ev) => handleMarksChange(e.student.id, ev.target.value)}
                      style={{
                        width: 90,
                        padding: '6px 8px',
                        border: '1px solid #e8e9f2',
                        borderRadius: 6,
                        fontSize: 13,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 14 }}>{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: 13, marginTop: 14 }}>{success}</p>}

        {enrollments.length > 0 && (
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ marginTop: 16 }}>
            {submitting ? 'Saving...' : 'Save Grades'}
          </button>
        )}
      </div>
    </PageLayout>
  );
}