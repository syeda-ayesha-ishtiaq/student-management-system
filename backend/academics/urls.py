from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    TeacherViewSet, StudentViewSet, CourseViewSet,
    EnrollmentViewSet, AttendanceViewSet, AcademicRecordViewSet,
    my_courses, student_my_courses, student_attendance, student_grades,
    admin_stats, teacher_stats, student_stats
)

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet)
router.register(r'students', StudentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'enrollments', EnrollmentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'academic-records', AcademicRecordViewSet)

urlpatterns = router.urls + [
    path('my-courses/', my_courses, name='my-courses'),
    path('student/my-courses/', student_my_courses, name='student-my-courses'),
    path('student/attendance/', student_attendance, name='student-attendance'),
    path('student/grades/', student_grades, name='student-grades'),
    path('stats/admin/', admin_stats, name='admin-stats'),
    path('stats/teacher/', teacher_stats, name='teacher-stats'),
    path('stats/student/', student_stats, name='student-stats'),
]