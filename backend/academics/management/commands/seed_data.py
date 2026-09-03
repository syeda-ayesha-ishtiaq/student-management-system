"""
Management command to seed test accounts, courses, and enrollments.

Usage:
    python manage.py seed_data

Safe to re-run: uses get_or_create everywhere, so running it twice
won't create duplicates or throw errors.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academics.models import Teacher, Student, Course, Enrollment

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with test accounts, courses, and enrollments."

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # --- Admin ---
        admin_user, created = User.objects.get_or_create(
            username='ayesha',
            defaults={'role': 'ADMIN', 'email': 'ayesha@example.com'}
        )
        if created:
            admin_user.set_password('adminpass123')
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin: ayesha / adminpass123"))
        else:
            self.stdout.write("Admin 'ayesha' already exists, skipping.")

        # --- Teachers ---
        teacher_specs = [
            ('mr_khan', 'khan@example.com', 'T001', 'Computer Science', '03001234567'),
            ('mr_shah', 'shah@example.com', 'T002', 'Computer Science', '03007654321'),
        ]
        teachers = {}
        for username, email, emp_id, dept, phone in teacher_specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'role': 'TEACHER', 'email': email}
            )
            if created:
                user.set_password('teacherpass123')
                user.save()
            teacher, _ = Teacher.objects.get_or_create(
                user=user,
                defaults={'employee_id': emp_id, 'department': dept, 'phone': phone}
            )
            teachers[username] = teacher
            self.stdout.write(self.style.SUCCESS(f"Teacher ready: {username} / teacherpass123"))

        # --- Students ---
        student_specs = [
            ('student1', 'student1@example.com', 'S001'),
            ('student2', 'student2@example.com', 'S002'),
        ]
        students = {}
        for username, email, roll in student_specs:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'role': 'STUDENT', 'email': email}
            )
            if created:
                user.set_password('studentpass123')
                user.save()
            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={'roll_number': roll}
            )
            students[username] = student
            self.stdout.write(self.style.SUCCESS(f"Student ready: {username} / studentpass123"))

        # --- Courses ---
        course, _ = Course.objects.get_or_create(
            code='CS101',
            defaults={'name': 'Intro to Programming', 'teacher': teachers['mr_khan']}
        )
        course2, _ = Course.objects.get_or_create(
            code='CS102',
            defaults={'name': 'Object Oriented Language', 'teacher': teachers['mr_shah']}
        )
        self.stdout.write(self.style.SUCCESS("Courses ready: CS101, CS102"))

        # --- Enrollments ---
        Enrollment.objects.get_or_create(student=students['student1'], course=course)
        Enrollment.objects.get_or_create(student=students['student2'], course=course)
        Enrollment.objects.get_or_create(student=students['student2'], course=course2)
        self.stdout.write(self.style.SUCCESS("Enrollments ready."))

        self.stdout.write(self.style.SUCCESS("\nSeeding complete."))
        self.stdout.write("\nLogin credentials:")
        self.stdout.write("  Admin:    ayesha / adminpass123")
        self.stdout.write("  Teacher:  mr_khan / teacherpass123")
        self.stdout.write("  Teacher:  mr_shah / teacherpass123")
        self.stdout.write("  Student:  student1 / studentpass123")
        self.stdout.write("  Student:  student2 / studentpass123")