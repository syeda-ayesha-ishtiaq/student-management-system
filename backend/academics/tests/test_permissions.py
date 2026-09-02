from rest_framework import status
from datetime import date
from .base import RoleTestCase
from academics.models import Attendance


class TeacherPermissionTest(RoleTestCase):
    def test_teacher_sees_only_own_courses(self):
        headers = self.login('teacher1')
        response = self.client.get('/api/my-courses/', **headers)
        codes = [c['code'] for c in response.data]
        self.assertIn('CS101', codes)
        self.assertNotIn('CS201', codes)

    def test_student_cannot_access_my_courses(self):
        headers = self.login('student1')
        response = self.client.get('/api/my-courses/', **headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_mark_attendance_for_own_course(self):
        headers = self.login('teacher1')
        response = self.client.post('/api/attendance/', {
            'student_id': self.student.id,
            'course_id': self.course.id,
            'date': str(date.today()),
            'status': 'P'
        }, **headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_teacher_cannot_mark_attendance_for_other_teachers_course(self):
        headers = self.login('teacher1')
        response = self.client.post('/api/attendance/', {
            'student_id': self.student.id,
            'course_id': self.other_course.id,
            'date': str(date.today()),
            'status': 'P'
        }, **headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_attendance_list_scoped_to_own_course(self):
        Attendance.objects.create(
            student=self.student, course=self.course, date=date.today(), status='P'
        )
        headers = self.login('teacher1')
        response = self.client.get('/api/attendance/', **headers)
        course_ids = {r['course']['id'] for r in response.data}
        self.assertEqual(course_ids, {self.course.id})


class StudentPermissionTest(RoleTestCase):
    def test_student_cannot_post_to_scoped_attendance_endpoint(self):
        headers = self.login('student1')
        response = self.client.post('/api/student/attendance/', {
            'course_id': self.course.id, 'date': str(date.today()), 'status': 'P'
        }, **headers)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_student_sees_only_own_attendance_via_scoped_endpoint(self):
        Attendance.objects.create(
            student=self.student, course=self.course, date=date.today(), status='P'
        )
        headers = self.login('student1')
        response = self.client.get('/api/student/attendance/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for record in response.data:
            self.assertEqual(record['student']['id'], self.student.id)


class KnownGapTest(RoleTestCase):
    """
    Confirms the previously-fixed gap in AttendanceViewSet stays fixed:
    students cannot read or write via the raw /api/attendance/ route.
    """
    def test_student_cannot_see_all_attendance_via_raw_viewset(self):
        Attendance.objects.create(
            student=self.student, course=self.other_course, date=date.today(), status='A'
        )
        headers = self.login('student1')
        response = self.client.get('/api/attendance/', **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_student_cannot_create_attendance_via_raw_viewset(self):
        headers = self.login('student1')
        response = self.client.post('/api/attendance/', {
            'student_id': self.student.id,
            'course_id': self.course.id,
            'date': str(date.today()),
            'status': 'P'
        }, **headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)