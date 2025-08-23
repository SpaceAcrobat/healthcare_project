from django.contrib import admin
from .models import Patient, Doctor, Assignment

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "age", "gender", "owner", "created_at")
    search_fields = ("name", "owner__username")

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "specialization", "experience_years", "email", "created_at")
    search_fields = ("name", "specialization", "email")

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "created_at")
    search_fields = ("patient__name", "doctor__name")
    list_filter = ("doctor__specialization",)
