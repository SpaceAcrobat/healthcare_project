# Healthcare Backend (Django + DRF + PostgreSQL + JWT)

## Quickstart
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env .env.local  # optional
# edit .env with your DB settings

# Migrate & run
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

## Auth
- POST `/api/auth/register/`  body: `{ "username": "...", "email": "...", "password": "...", "first_name": "...", "last_name": "..." }`
- POST `/api/auth/login/`      body: `{ "username": "...", "password": "..." }` -> returns access/refresh JWT
- POST `/api/auth/refresh/`    body: `{ "refresh": "..." }` -> returns new access

## Patients (auth required)
- POST `/api/patients/`
- GET  `/api/patients/`
- GET  `/api/patients/<id>/`
- PUT  `/api/patients/<id>/`
- DELETE `/api/patients/<id>/`

## Doctors (auth required)
- POST `/api/doctors/`
- GET  `/api/doctors/`
- GET  `/api/doctors/<id>/`
- PUT  `/api/doctors/<id>/`
- DELETE `/api/doctors/<id>/`

## Mappings (auth required)
- POST `/api/mappings/`  (patient, doctor)
- GET  `/api/mappings/`
- GET  `/api/mappings/patient/<patient_id>/`
- DELETE `/api/mappings/<id>/`

## Notes
- Patients are always filtered to the authenticated owner.
- Mapping creation enforces that you can only map *your own* patients.
