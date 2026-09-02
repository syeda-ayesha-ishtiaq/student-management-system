from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Teacher, Student, Course, Enrollment, Attendance, AcademicRecord
from .serializers import (
    TeacherSerializer, StudentSerializer, CourseSerializer,
    EnrollmentSerializer, AttendanceSerializer, AcademicRecordSerializer
)
from .permissions import IsTeacherUser, IsStudentUser
from django.db.models import Avg, Count


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Enrollment.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'TEACHER':
            return Attendance.objects.filter(course__teacher__user=user)
        elif user.role == 'STUDENT':
            # Students must use /api/student/attendance/ for their own records.
            return Attendance.objects.none()
        return Attendance.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'TEACHER':
            course = serializer.validated_data.get('course')
            if course.teacher.user != user:
                raise PermissionDenied("You can only mark attendance for your own courses.")
            serializer.save(marked_by=user.teacher_profile)
        elif user.role == 'STUDENT':
            raise PermissionDenied("Students cannot create attendance records.")
        else:
            serializer.save()


class AcademicRecordViewSet(viewsets.ModelViewSet):
    queryset = AcademicRecord.objects.all()
    serializer_class = AcademicRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'TEACHER':
            return AcademicRecord.objects.filter(course__teacher__user=user)
        elif user.role == 'STUDENT':
            # Students must use /api/student/grades/ for their own records.
            return AcademicRecord.objects.none()
        return AcademicRecord.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'TEACHER':
            course = serializer.validated_data.get('course')
            if course.teacher.user != user:
                raise PermissionDenied("You can only add grades for your own courses.")
        elif user.role == 'STUDENT':
            raise PermissionDenied("Students cannot create academic records.")
        serializer.save()


@api_view(['GET'])
@permission_classes([IsTeacherUser])
def my_courses(request):
    try:
        teacher = request.user.teacher_profile
    except Teacher.DoesNotExist:
        return Response({"detail": "No teacher profile found for this user."}, status=400)

    courses = Course.objects.filter(teacher=teacher)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsStudentUser])
def student_my_courses(request):
    try:
        student = request.user.student_profile
    except Student.DoesNotExist:
        return Response({"detail": "No student profile found for this user."}, status=400)

    enrollments = Enrollment.objects.filter(student=student)
    courses = [e.course for e in enrollments]
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsStudentUser])
def student_attendance(request):
    try:
        student = request.user.student_profile
    except Student.DoesNotExist:
        return Response({"detail": "No student profile found for this user."}, status=400)

    records = Attendance.objects.filter(student=student)
    course_id = request.query_params.get('course')
    if course_id:
        records = records.filter(course_id=course_id)

    serializer = AttendanceSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsStudentUser])
def student_grades(request):
    try:
        student = request.user.student_profile
    except Student.DoesNotExist:
        return Response({"detail": "No student profile found for this user."}, status=400)

    records = AcademicRecord.objects.filter(student=student)
    course_id = request.query_params.get('course')
    if course_id:
        records = records.filter(course_id=course_id)

    serializer = AcademicRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_stats(request):
    if request.user.role != 'ADMIN':
        return Response({"detail": "Admin access required."}, status=403)

    # --- Org-wide attendance rate ---
    total_attendance = Attendance.objects.count()
    present_count = Attendance.objects.filter(status='P').count()
    attendance_rate = (
        round((present_count / total_attendance) * 100, 1)
        if total_attendance > 0 else None
    )

    # --- Grade distribution across all academic records ---
    grade_bands = [
        ('A+', 90, 101),
        ('A', 80, 90),
        ('B', 70, 80),
        ('C', 60, 70),
        ('F', 0, 60),
    ]
    grade_distribution = []
    all_records = AcademicRecord.objects.all()
    total_records = all_records.count()
    percentages = []

    if total_records > 0:
        percentages = [
            (float(r.marks_obtained) / float(r.max_marks)) * 100
            for r in all_records if r.max_marks
        ]
        for label, low, high in grade_bands:
            count = sum(1 for p in percentages if low <= p < high)
            pct = round((count / len(percentages)) * 100, 1) if percentages else 0
            grade_distribution.append({"label": label, "count": count, "percentage": pct})

    average_score = (
        round(sum(percentages) / len(percentages), 1)
        if percentages else None
    )

    return Response({
        "total_teachers": Teacher.objects.count(),
        "total_students": Student.objects.count(),
        "total_courses": Course.objects.count(),
        "total_enrollments": Enrollment.objects.count(),
        "attendance_rate": attendance_rate,
        "average_score": average_score,
        "grade_distribution": grade_distribution,
    })


@api_view(['GET'])
@permission_classes([IsTeacherUser])
def teacher_stats(request):
    try:
        teacher = request.user.teacher_profile
    except Teacher.DoesNotExist:
        return Response({"detail": "No teacher profile found for this user."}, status=400)

    courses = Course.objects.filter(teacher=teacher)
    course_count = courses.count()
    student_count = Enrollment.objects.filter(course__in=courses).values('student').distinct().count()

    return Response({
        "total_courses": course_count,
        "total_students": student_count,
    })


@api_view(['GET'])
@permission_classes([IsStudentUser])
def student_stats(request):
    try:
        student = request.user.student_profile
    except Student.DoesNotExist:
        return Response({"detail": "No student profile found for this user."}, status=400)

    course_count = Enrollment.objects.filter(student=student).count()

    attendance_qs = Attendance.objects.filter(student=student)
    total_attendance = attendance_qs.count()
    present_count = attendance_qs.filter(status='P').count()
    attendance_pct = round((present_count / total_attendance) * 100, 1) if total_attendance > 0 else None

    grades_qs = AcademicRecord.objects.filter(student=student)
    avg_pct = None
    if grades_qs.exists():
        percentages = [
            (float(r.marks_obtained) / float(r.max_marks)) * 100
            for r in grades_qs if r.max_marks
        ]
        avg_pct = round(sum(percentages) / len(percentages), 1) if percentages else None

    return Response({
        "total_courses": course_count,
        "attendance_percentage": attendance_pct,
        "average_grade_percentage": avg_pct,
    })