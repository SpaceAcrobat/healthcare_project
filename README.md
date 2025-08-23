@"
# Healocity – Healthcare Management API
_A secure and scalable backend for managing patients, doctors, and healthcare data._

![Django](https://img.shields.io/badge/Django-REST%20Framework-green) ![Python](https://img.shields.io/badge/Python-3.x-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-lightblue) ![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📌 Overview
Healocity is a **Django + DRF-based API** for healthcare management. It provides a **secure, token-based authentication system** using JWT and allows CRUD operations for **patients, doctors, and patient-doctor mappings**.

The project is designed for **hospitals, clinics, and health startups** that need a robust backend for managing medical records.

---

## 🚀 Features
✅ User Authentication (JWT)  
✅ Manage Patients (Create, Read, Update, Delete)  
✅ Manage Doctors  
✅ Map Patients to Doctors  
✅ Secure API (Auth required for sensitive routes)  
✅ Scalable architecture for real-world deployment  

---

## 🛠 Tech Stack
- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Environment Management:** .env
- **Deployment Ready:** requirements.txt

---

## ⚡ Setup Instructions
### 1. Clone the repo
\`\`\`bash
git clone https://github.com/SpaceAcrobat/healthcare_project.git
cd healthcare_project
\`\`\`

### 2. Create virtual environment
\`\`\`bash
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
\`\`\`

### 3. Install dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Configure environment
Create a **.env** file:
\`\`\`
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/yourdbname
\`\`\`

### 5. Run migrations
\`\`\`bash
python manage.py migrate
\`\`\`

### 6. Create superuser
\`\`\`bash
python manage.py createsuperuser
\`\`\`

### 7. Start server
\`\`\`bash
python manage.py runserver
\`\`\`

---

## 🔑 API Endpoints
### **Auth**
- POST \`/api/auth/register/\` → Register new user
- POST \`/api/auth/login/\` → Get JWT token
- POST \`/api/auth/refresh/\` → Refresh token

### **Patients**
- POST \`/api/patients/\`
- GET \`/api/patients/\`
- GET \`/api/patients/<id>/\`
- PUT \`/api/patients/<id>/\`
- DELETE \`/api/patients/<id>/\`

### **Doctors**
- Same structure as patients

### **Mappings**
- POST \`/api/mappings/\` → Map patient to doctor
- GET \`/api/mappings/\` → List all mappings
- GET \`/api/mappings/patient/<id>/\` → Get patient mappings
- DELETE \`/api/mappings/<id>/\` → Remove mapping

---

## 🔥 Future Enhancements
- ✅ Appointment Scheduling
- ✅ Prescription Management
- ✅ AI-based Disease Prediction
- ✅ Voice Assistant for Patients
- ✅ Analytics Dashboard

---

## 📜 License
This project is licensed under the **MIT License**.
"@ | Out-File -FilePath README.md -Encoding utf8
