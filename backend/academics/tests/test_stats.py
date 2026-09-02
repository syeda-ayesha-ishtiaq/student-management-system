from rest_framework import status
from datetime import date, timedelta
from .base import RoleTestCase
from academics.models import Attendance, AcademicRecord


class AdminStatsTest(RoleTestCase):
    def test_non_admin_forbidden(self):
        headers = self.login('teacher1')
        response = self.client.get('/api/stats/admin/', **headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_stats_counts(self):
        headers = self.login('admin1')
        response = self.client.get('/api/stats/admin/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_teachers'], 2)
        self.assertEqual(response.data['total_students'], 1)
        self.assertEqual(response.data['total_courses'], 2)
        self.assertEqual(response.data['total_enrollments'], 1)

    def test_admin_stats_includes_attendance_and_grades(self):
        Attendance.objects.create(
            student=self.student, course=self.course, date=date.today(), status='P'
        )
        AcademicRecord.objects.create(
            student=self.student, course=self.course,
            exam_type='Midterm', marks_obtained=95, max_marks=100
        )
        headers = self.login('admin1')
        response = self.client.get('/api/stats/admin/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['attendance_rate'], 100.0)
        self.assertEqual(response.data['average_score'], 95.0)
        self.assertTrue(len(response.data['grade_distribution']) > 0)

    def test_admin_stats_with_no_attendance_or_grades(self):
        headers = self.login('admin1')
        response = self.client.get('/api/stats/admin/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['attendance_rate'])
        self.assertIsNone(response.data['average_score'])
        self.assertEqual(response.data['grade_distribution'], [])


class TeacherStatsTest(RoleTestCase):
    def test_teacher_stats_scoped_to_own_courses(self):
        headers = self.login('teacher1')
        response = self.client.get('/api/stats/teacher/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_courses'], 1)
        self.assertEqual(response.data['total_students'], 1)

    def test_student_cannot_access_teacher_stats(self):
        headers = self.login('student1')
        response = self.client.get('/api/stats/teacher/', **headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class StudentStatsTest(RoleTestCase):
    def setUp(self):
        super().setUp()
        for i in range(3):
            Attendance.objects.create(
                student=self.student, course=self.course,
                date=date.today() - timedelta(days=i), status='P'
            )
        Attendance.objects.create(
            student=self.student, course=self.course,
            date=date.today() - timedelta(days=3), status='A'
        )
        AcademicRecord.objects.create(
            student=self.student, course=self.course,
            exam_type='Midterm', marks_obtained=90, max_marks=100
        )
        AcademicRecord.objects.create(
            student=self.student, course=self.course,
            exam_type='Final', marks_obtained=80, max_marks=100
        )

    def test_student_stats_attendance_percentage(self):
        headers = self.login('student1')
        response = self.client.get('/api/stats/student/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['attendance_percentage'], 75.0)

    def test_student_stats_grade_average(self):
        headers = self.login('student1')
        response = self.client.get('/api/stats/student/', **headers)
        self.assertEqual(response.data['average_grade_percentage'], 85.0)

    def test_student_stats_total_courses(self):
        headers = self.login('student1')
        response = self.client.get('/api/stats/student/', **headers)
        self.assertEqual(response.data['total_courses'], 1)


class StudentStatsNoDataTest(RoleTestCase):
    def test_student_stats_with_no_attendance_or_grades(self):
        """No records yet -> percentages should be None, not a crash."""
        headers = self.login('student1')
        response = self.client.get('/api/stats/student/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['attendance_percentage'])
        self.assertIsNone(response.data['average_grade_percentage'])