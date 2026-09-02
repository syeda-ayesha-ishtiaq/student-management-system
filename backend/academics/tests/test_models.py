from django.db import IntegrityError
from django.core.exceptions import ValidationError
from datetime import date
from .base import RoleTestCase
from academics.models import Attendance, AcademicRecord

class AttendanceModelTest(RoleTestCase):
    def test_duplicate_attendance_same_day_rejected(self):
        Attendance.objects.create(
            student=self.student, course=self.course,
            date=date.today(), status='P'
        )
        with self.assertRaises(IntegrityError):
            Attendance.objects.create(
                student=self.student, course=self.course,
                date=date.today(), status='A'
            )

class AcademicRecordModelTest(RoleTestCase):
    def test_duplicate_exam_type_rejected(self):
        AcademicRecord.objects.create(
            student=self.student, course=self.course,
            exam_type='Midterm', marks_obtained=80, max_marks=100
        )
        with self.assertRaises(IntegrityError):
            AcademicRecord.objects.create(
                student=self.student, course=self.course,
                exam_type='Midterm', marks_obtained=70, max_marks=100
            )

    def test_marks_exceeding_max_raises_validation_error(self):
        record = AcademicRecord(
            student=self.student, course=self.course,
            exam_type='Final', marks_obtained=120, max_marks=100
        )
        with self.assertRaises(ValidationError):
            record.full_clean()

class EnrollmentModelTest(RoleTestCase):
    def test_student_enrolled_in_course(self):
        self.assertIn(self.student, self.course.students.all())