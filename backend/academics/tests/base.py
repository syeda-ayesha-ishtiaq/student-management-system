from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from academics.models import Teacher, Student, Course, Enrollment

User = get_user_model()

class RoleTestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin1', password='pass1234', role='ADMIN'
        )

        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass1234', role='TEACHER'
        )
        self.teacher = Teacher.objects.create(
            user=self.teacher_user, employee_id='EMP001'
        )

        self.other_teacher_user = User.objects.create_user(
            username='teacher2', password='pass1234', role='TEACHER'
        )
        self.other_teacher = Teacher.objects.create(
            user=self.other_teacher_user, employee_id='EMP002'
        )

        self.student_user = User.objects.create_user(
            username='student1', password='pass1234', role='STUDENT'
        )
        self.student = Student.objects.create(
            user=self.student_user, roll_number='R001'
        )

        self.course = Course.objects.create(
            name='Intro to Programming', code='CS101', teacher=self.teacher
        )
        self.other_course = Course.objects.create(
            name='Data Structures', code='CS201', teacher=self.other_teacher
        )
        Enrollment.objects.create(student=self.student, course=self.course)

    def login(self, username, password='pass1234'):
        response = self.client.post('/api/token/', {
            'username': username, 'password': password
        })
        token = response.data['access']
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}