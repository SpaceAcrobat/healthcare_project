# Healocity – Healthcare Management API

_A secure and scalable backend for managing patients, doctors, and healthcare data._

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Django](https://img.shields.io/badge/Django-REST%20Framework-green)
![Python](https://img.shields.io/badge/Python-3.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-lightblue)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---
# 📌 Overview
Healocity is a Django + Django REST Framework (DRF) based healthcare management API.
It allows you to manage patients, doctors, and their mappings, and includes an optional specialization recommendation feature.

✅ Features

Patient Management – Add, view, update, and delete patient records

Doctor Management – Add, view, update, and delete doctor records

Patient-Doctor Mapping – Assign patients to doctors

Specialization Recommendation – Suggests doctor specialization based on symptoms

Frontend – Simple UI using HTML + Vanilla JS

Secure APIs – JWT authentication support (optional)

🛠 Tech Stack

Backend: Django, Django REST Framework

Database: SQLite (default)

Frontend: HTML, JavaScript

Authentication: JWT (optional)

📂 Project Structure
healthcare_project/
│
├── api/                  # API app
│   ├── admin.py
│   ├── apps.py
│   ├── models.py         # Patient, Doctor, Mapping models
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── urls.py           # API endpoints
│   ├── tests.py
│
├── healthcare/           # Project settings
│   ├── settings.py
│   ├── urls.py           # Main URL routing
│   ├── asgi.py
│   ├── wsgi.py
│
├── static/               # Static files
│   ├── app.js            # Frontend JS
│
├── templates/            # HTML templates
│   ├── index.html        # UI for API interaction
│
├── doctors.csv           # Doctor data (CSV)
├── requirements.txt      # Dependencies
├── README.md             # Documentation
├── manage.py
└── db.sqlite3            # Database

⚡ Installation & Setup


# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Run server
python manage.py runserver


Visit: http://127.0.0.1:8000/

🔗 API Endpoints
Patients
GET    /api/patients/          # List patients
POST   /api/patients/          # Create patient
GET    /api/patients/{id}/     # Retrieve patient
PUT    /api/patients/{id}/     # Update patient
DELETE /api/patients/{id}/     # Delete patient

Doctors
GET    /api/doctors/
POST   /api/doctors/
GET    /api/doctors/{id}/
PUT    /api/doctors/{id}/
DELETE /api/doctors/{id}/

Patient-Doctor Mappings
GET    /api/mappings/
POST   /api/mappings/      # { "patient": 1, "doctor": 2 }

Specialization Recommendation (Optional)
POST /api/recommend/       # { "symptoms": "fever, cough" }

🖥 Frontend (index.html)

Basic UI built using HTML + JS

Interacts with API using fetch() in app.js

🔒 Authentication (Optional)

Install JWT:

pip install djangorestframework-simplejwt


Update settings.py and urls.py to enable token-based auth.

🔮 Future Enhancements

Role-based access (Admin, Doctor, Patient)

File upload for medical reports

Analytics dashboard with charts

📜 License

This project is licensed under the MIT License.
