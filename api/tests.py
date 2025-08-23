from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Patient, Doctor, Assignment

class APISmokeTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', password='StrongPassw0rd!')
        # Login
        resp = self.client.post(reverse('auth-login'), {'username':'alice', 'password':'StrongPassw0rd!'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_crud_flow(self):
        # Create Doctor
        d = {'name':'John Doe','specialization':'Cardiology','experience_years':10,'phone':'1234567890','email':'doc@example.com'}
        resp = self.client.post('/api/doctors/', d, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        doctor_id = resp.data['id']

        # Create Patient
        p = {'name':'Bob','age':30,'gender':'M','address':'Addr','phone':'999'}
        resp = self.client.post('/api/patients/', p, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        patient_id = resp.data['id']

        # Map
        resp = self.client.post('/api/mappings/', {'patient': patient_id, 'doctor': doctor_id}, format='json')
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))

        # List mappings by patient
        resp = self.client.get(f'/api/mappings/patient/{patient_id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
