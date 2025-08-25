import time
from rest_framework import viewsets, generics, status, permissions, serializers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import get_user_model

from .models import Patient, Doctor, Assignment
from .serializers import (
    RegisterSerializer, PatientSerializer, DoctorSerializer, AssignmentSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by('name')
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # FIX: Disable pagination for this viewset to return ALL doctors at once.
    pagination_class = None


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_patients = Patient.objects.filter(owner=self.request.user)
        return Assignment.objects.filter(patient__in=user_patients)

    def perform_create(self, serializer):
        patient = serializer.validated_data.get("patient")
        if patient.owner != self.request.user:
            raise serializers.ValidationError("You can only assign doctors to your own patients.")
        serializer.save()

    @action(detail=False, methods=["get"])
    def by_patient(self, request):
        pid = request.query_params.get("patient_id")
        qs = self.get_queryset()
        if pid:
            qs = qs.filter(patient_id=pid)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def symptom_checker_view(request):
    symptoms = (request.data.get("symptoms") or "").lower().strip()
    if not symptoms:
        return Response({"error": "Symptoms are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        time.sleep(1)
        specialization = "General Practice"
        if "heart" in symptoms or "chest" in symptoms:
            specialization = "Cardiology"
        elif "skin" in symptoms or "rash" in symptoms:
            specialization = "Dermatology"
        elif "headache" in symptoms or "nerve" in symptoms:
            specialization = "Neurology"
        elif "stomach" in symptoms or "digest" in symptoms:
            specialization = "Gastroenterology"
        elif "bone" in symptoms or "joint" in symptoms:
            specialization = "Orthopedics"

        matching_doctors = Doctor.objects.filter(specialization__icontains=specialization)
        serializer = DoctorSerializer(matching_doctors, many=True)

        return Response({
            "recommended_specialization": specialization,
            "recommended_doctors": serializer.data
        })
    except Exception as e:
        return Response(
            {"error": f"An unexpected error occurred: {e}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
