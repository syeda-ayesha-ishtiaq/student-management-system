from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Teacher(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher_profile"
    )
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.employee_id})"


class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )
    roll_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.roll_number})"


class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="courses"
    )
    students = models.ManyToManyField(
        Student,
        through="Enrollment",
        related_name="courses"
    )

    def __str__(self):
        return f"{self.code} - {self.name}"


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrolled_on = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student} -> {self.course}"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("P", "Present"),
        ("A", "Absent"),
        ("L", "Late"),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance_records")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default="P")
    marked_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course", "date"],
                name="unique_attendance_per_day"
            )
        ]
        ordering = ["-date"]

    def __str__(self):
        return f"{self.student} - {self.course} - {self.date} - {self.get_status_display()}"


class AcademicRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="academic_records")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="academic_records")
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    exam_type = models.CharField(max_length=50, default="Final")
    date_recorded = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course", "exam_type")

    def clean(self):
        if self.marks_obtained > self.max_marks:
            raise ValidationError("Marks obtained cannot exceed max marks.")

    def __str__(self):
        return f"{self.student} - {self.course} - {self.marks_obtained}/{self.max_marks}"