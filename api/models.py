from django.db import models
from django.contrib.auth import get_user_model

# Get the active User model from Django's authentication system
User = get_user_model()

class Patient(models.Model):
    """
    Represents a patient record in the database.
    Each patient is owned by a specific user (e.g., a receptionist or the patient themselves).
    """
    # Fields for patient details
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # A patient must be linked to a user account.
    # If the user is deleted, all their associated patients are also deleted (CASCADE).
    owner = models.ForeignKey(User, related_name='patients', on_delete=models.CASCADE)
    
    # Timestamps for record management
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"


class Doctor(models.Model):
    """
    Represents a doctor record in the database.
    Doctors are considered general data and are not owned by any specific user.
    """
    # Fields for doctor details
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField()
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"


class Assignment(models.Model):
    """
    Represents the mapping between a Patient and a Doctor.
    This is a "through" model that connects the two.
    """
    # The patient being assigned. If the patient is deleted, this assignment is also deleted.
    patient = models.ForeignKey(Patient, related_name='assignments', on_delete=models.CASCADE)
    
    # The doctor being assigned. If the doctor is deleted, this assignment is also deleted.
    doctor = models.ForeignKey(Doctor, related_name='assignments', on_delete=models.CASCADE)
    
    # Timestamp for when the assignment was made
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures that a patient cannot be assigned to the same doctor more than once.
        unique_together = ('patient', 'doctor')

    def __str__(self):
        return f"Assignment: {self.patient.name} -> Dr. {self.doctor.name}"
