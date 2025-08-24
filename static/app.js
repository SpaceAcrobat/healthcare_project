document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://127.0.0.1:8000/api';
    let token = localStorage.getItem('accessToken');
    let patientsData = [];
    let doctorsData = [];

    // Views
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');

    // Forms & Buttons
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleAuthLink = document.getElementById('toggle-auth');
    const logoutButton = document.getElementById('logout-button');
    
    // Modals & Forms
    const patientModal = document.getElementById('patient-modal');
    const doctorModal = document.getElementById('doctor-modal');
    const addPatientBtn = document.getElementById('add-patient-btn');
    const addDoctorBtn = document.getElementById('add-doctor-btn');
    const patientForm = document.getElementById('patient-form');
    const doctorForm = document.getElementById('doctor-form');


    // Data Display
    const patientsList = document.getElementById('patients-list');
    const doctorsList = document.getElementById('doctors-list');
    const welcomeMessage = document.getElementById('welcome-message');

    // --- API Request Helper ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(API_BASE + endpoint, config);
            if (!response.ok) {
                if (response.status === 401) {
                    handleLogout();
                }
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            if (response.status === 204) {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            alert('An error occurred: ' + error.message);
            return null;
        }
    }

    // --- UI Rendering ---
    function showView(view) {
        authView.classList.add('hidden');
        dashboardView.classList.add('hidden');
        if (view === 'auth') {
            authView.classList.remove('hidden');
        } else {
            dashboardView.classList.remove('hidden');
        }
    }
    
    function renderPatients(patients) {
        patientsList.innerHTML = '';
        if (!patients || patients.length === 0) {
            patientsList.innerHTML = `<p class="text-gray-500">No patients found. Add one to get started!</p>`;
            return;
        }
        patients.forEach(p => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow card';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">${p.name}</h3>
                        <p class="text-sm text-gray-600">Age: ${p.age}, Gender: ${p.gender}</p>
                        <p class="text-sm text-gray-500">${p.address || ''}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button data-id="${p.id}" class="edit-patient-btn text-sm text-blue-500 hover:underline">Edit</button>
                        <button data-id="${p.id}" class="delete-patient-btn text-sm text-red-500 hover:underline">Delete</button>
                    </div>
                </div>
            `;
            patientsList.appendChild(card);
        });
    }

    function renderDoctors(doctors) {
        doctorsList.innerHTML = '';
         if (!doctors || doctors.length === 0) {
            doctorsList.innerHTML = `<p class="text-gray-500">No doctors found.</p>`;
            return;
        }
        doctors.forEach(d => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow card';
            card.innerHTML = `
                 <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">Dr. ${d.name}</h3>
                        <p class="text-sm text-gray-600">${d.specialization}</p>
                        <p class="text-sm text-gray-500">${d.email}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button data-id="${d.id}" class="edit-doctor-btn text-sm text-blue-500 hover:underline">Edit</button>
                        <button data-id="${d.id}" class="delete-doctor-btn text-sm text-red-500 hover:underline">Delete</button>
                    </div>
                </div>
            `;
            doctorsList.appendChild(card);
        });
    }

    // --- Data Fetching and Display ---
    async function loadDashboard() {
        if (!token) {
            showView('auth');
            return;
        }
        showView('dashboard');
        welcomeMessage.textContent = `Welcome back, ${localStorage.getItem('username')}!`;
        
        const [patients, doctors] = await Promise.all([
            apiRequest('/patients/'),
            apiRequest('/doctors/')
        ]);

        if (patients) {
            patientsData = patients.results;
            renderPatients(patientsData);
        }
        if (doctors) {
            doctorsData = doctors.results;
            renderDoctors(doctorsData);
        }
    }

    // --- Event Handlers ---
    function handleLogout() {
        token = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        showView('auth');
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const data = await apiRequest('/auth/login/', 'POST', { username, password });
        if (data && data.access) {
            token = data.access;
            localStorage.setItem('accessToken', token);
            localStorage.setItem('username', username);
            loadDashboard();
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const data = await apiRequest('/auth/register/', 'POST', { username, email, password });
        if (data) {
            alert('Registration successful! Please log in.');
            toggleAuthForms();
        }
    });
    
    patientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const patientId = document.getElementById('patient-id').value;
        const patientData = {
            name: document.getElementById('patient-name').value,
            age: document.getElementById('patient-age').value,
            gender: document.getElementById('patient-gender').value,
            address: document.getElementById('patient-address').value,
        };

        const method = patientId ? 'PUT' : 'POST';
        const endpoint = patientId ? `/patients/${patientId}/` : '/patients/';
        
        const result = await apiRequest(endpoint, method, patientData);
        if (result) {
            closeAllModals();
            loadDashboard();
        }
    });
    
    doctorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const doctorId = document.getElementById('doctor-id').value;
        const doctorData = {
            name: document.getElementById('doctor-name').value,
            specialization: document.getElementById('doctor-specialization').value,
            email: document.getElementById('doctor-email').value,
        };
        
        const method = doctorId ? 'PUT' : 'POST';
        const endpoint = doctorId ? `/doctors/${doctorId}/` : '/doctors/';

        const result = await apiRequest(endpoint, method, doctorData);
        if (result) {
            closeAllModals();
            loadDashboard();
        }
    });

    logoutButton.addEventListener('click', handleLogout);

    function toggleAuthForms() {
        const isLogin = registerForm.classList.contains('hidden');
        if (isLogin) {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            document.getElementById('auth-title').textContent = 'Create Account';
            document.getElementById('auth-subtitle').textContent = 'Get started with a new account.';
            toggleAuthLink.textContent = 'Already have an account? Login';
        } else {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            document.getElementById('auth-title').textContent = 'Login';
            document.getElementById('auth-subtitle').textContent = 'Welcome back!';
            toggleAuthLink.textContent = "Don't have an account? Register";
        }
    }
    toggleAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms();
    });
    
    // --- Modal Handling ---
    function closeAllModals() {
        patientModal.classList.add('hidden');
        doctorModal.classList.add('hidden');
    }

    addPatientBtn.addEventListener('click', () => {
        patientForm.reset();
        document.getElementById('patient-id').value = '';
        document.getElementById('patient-modal-title').textContent = 'Add New Patient';
        patientModal.classList.remove('hidden');
    });

    addDoctorBtn.addEventListener('click', () => {
        doctorForm.reset();
        document.getElementById('doctor-id').value = '';
        document.getElementById('doctor-modal-title').textContent = 'Add New Doctor';
        doctorModal.classList.remove('hidden');
    });

    document.querySelectorAll('.cancel-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // --- Dynamic Event Listeners for Edit/Delete ---
    document.body.addEventListener('click', async (e) => {
        // Edit Patient
        if (e.target.classList.contains('edit-patient-btn')) {
            const id = e.target.dataset.id;
            const patient = patientsData.find(p => p.id == id);
            if (patient) {
                document.getElementById('patient-id').value = patient.id;
                document.getElementById('patient-name').value = patient.name;
                document.getElementById('patient-age').value = patient.age;
                document.getElementById('patient-gender').value = patient.gender;
                document.getElementById('patient-address').value = patient.address;
                document.getElementById('patient-modal-title').textContent = 'Edit Patient';
                patientModal.classList.remove('hidden');
            }
        }
        // Delete Patient
        if (e.target.classList.contains('delete-patient-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this patient?')) {
                const result = await apiRequest(`/patients/${id}/`, 'DELETE');
                loadDashboard();
            }
        }
        // Edit Doctor
        if (e.target.classList.contains('edit-doctor-btn')) {
            const id = e.target.dataset.id;
            const doctor = doctorsData.find(d => d.id == id);
            if (doctor) {
                document.getElementById('doctor-id').value = doctor.id;
                document.getElementById('doctor-name').value = doctor.name;
                document.getElementById('doctor-specialization').value = doctor.specialization;
                document.getElementById('doctor-email').value = doctor.email;
                document.getElementById('doctor-modal-title').textContent = 'Edit Doctor';
                doctorModal.classList.remove('hidden');
            }
        }
        // Delete Doctor
        if (e.target.classList.contains('delete-doctor-btn')) {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this doctor?')) {
                await apiRequest(`/doctors/${id}/`, 'DELETE');
                loadDashboard();
            }
        }
    });

    // --- Initial Load ---
    loadDashboard();
});
