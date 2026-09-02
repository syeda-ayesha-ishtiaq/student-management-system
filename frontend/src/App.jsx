import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Courses from './pages/admin/Courses';
import Enrollments from './pages/admin/Enrollments';
import TeacherMyCourses from './pages/teacher/MyCourses';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherGrades from './pages/teacher/Grades';
import StudentMyCourses from './pages/student/MyCourses';
import StudentAttendance from './pages/student/Attendance';
import StudentGrades from './pages/student/Grades';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/enrollments"
        element={
          <ProtectedRoute>
            <Enrollments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute>
            <TeacherMyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/:courseId/attendance"
        element={
          <ProtectedRoute>
            <TeacherAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses/:courseId/grades"
        element={
          <ProtectedRoute>
            <TeacherGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute>
            <StudentMyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId/attendance"
        element={
          <ProtectedRoute>
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId/grades"
        element={
          <ProtectedRoute>
            <StudentGrades />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;