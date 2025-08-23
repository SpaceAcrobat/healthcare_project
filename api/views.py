from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Patient, Doctor, Assignment
from .serializers import (
    RegisterSerializer,
    PatientSerializer,
    DoctorSerializer,
    AssignmentSerializer,
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related("patient", "doctor").all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Ensure patient belongs to the requesting user
        patient_id = request.data.get("patient")
        patient = get_object_or_404(Patient, id=patient_id, owner=request.user)
        doctor_id = request.data.get("doctor")
        doctor = get_object_or_404(Doctor, id=doctor_id)
        assignment, created = Assignment.objects.get_or_create(patient=patient, doctor=doctor)
        serializer = self.get_serializer(assignment)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    @action(detail=False, methods=["get"], url_path=r'patient/(?P<patient_id>[^/.]+)')
    def by_patient(self, request, patient_id=None):
        # Only allow viewing mappings for own patients
        patient = get_object_or_404(Patient, id=patient_id, owner=request.user)
        qs = Assignment.objects.filter(patient=patient)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
