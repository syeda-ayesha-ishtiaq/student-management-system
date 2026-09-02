from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import User
from .models import Teacher, Student, Course, Enrollment, Attendance, AcademicRecord


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'username', 'email', 'password', 'employee_id', 'department', 'phone']

    def create(self, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', '')
        password = validated_data.pop('password', None)

        if not username or not password:
            raise serializers.ValidationError(
                "username and password are required to create a teacher account."
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='TEACHER',
        )
        teacher = Teacher.objects.create(user=user, **validated_data)
        return teacher


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Student
        fields = ['id', 'user', 'username', 'email', 'password', 'roll_number', 'date_of_birth', 'phone']

    def create(self, validated_data):
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', '')
        password = validated_data.pop('password', None)

        if not username or not password:
            raise serializers.ValidationError(
                "username and password are required to create a student account."
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='STUDENT',
        )
        student = Student.objects.create(user=user, **validated_data)
        return student

class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), source='teacher', write_only=True, required=False
    )

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'teacher', 'teacher_id']


class EnrollmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source='student', write_only=True
    )
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'student_id', 'course_id', 'enrolled_on']


class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source='student', write_only=True
    )
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'course', 'student_id', 'course_id',
            'date', 'status', 'marked_by'
        ]


class AcademicRecordSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source='student', write_only=True
    )
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )

    class Meta:
        model = AcademicRecord
        fields = [
            'id', 'student', 'course', 'student_id', 'course_id',
            'marks_obtained', 'max_marks', 'exam_type', 'date_recorded'
        ]