from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Patient, Doctor, Assignment

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('id', 'name', 'specialization', 'experience_years', 'phone', 'email', 'created_at')
        read_only_fields = ('id', 'created_at')


class AssignmentSerializer(serializers.ModelSerializer):
    # When reading an assignment, we want to see the doctor's details.
    doctor = DoctorSerializer(read_only=True)
    
    # For writing, we only need the IDs.
    patient_id = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), source='patient', write_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all(), source='doctor', write_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'doctor', 'patient_id', 'doctor_id', 'created_at')
        read_only_fields = ('id', 'created_at')


class PatientSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    # UPGRADE: Nest the assignment data directly within the patient data.
    # This will show all doctors assigned to this patient.
    assignments = AssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = ('id', 'name', 'age', 'gender', 'address', 'phone', 'owner', 'created_at', 'assignments')
        read_only_fields = ('id', 'owner', 'created_at')
