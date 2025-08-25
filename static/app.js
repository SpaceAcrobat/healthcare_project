document.addEventListener('DOMContentLoaded', () => {
    
    // Application State
    const state = {
        token: localStorage.getItem('accessToken'),
        patients: [],
        allDoctors: [],
        recommendedDoctors: [],
        currentDoctorId: null,
    };

    // API Layer: Handles all communication with the backend
    const api = {
        _baseUrl: 'http://127.0.0.1:8000/api',
        
        async _request(endpoint, method = "GET", body = null) {
            const headers = { "Content-Type": "application/json" };
            if (state.token) {
                headers["Authorization"] = `Bearer ${state.token}`;
            }
            const response = await fetch(`${this._baseUrl}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });
            if (!response.ok) {
                let errorMsg;
                try { errorMsg = await response.json(); } 
                catch {
                    const text = await response.text();
                    errorMsg = { detail: `Server returned a non-JSON response. Status: ${response.status}. Body: ${text.substring(0, 200)}...` };
                }
                throw errorMsg;
            }
            return response.status === 204 ? null : response.json();
        },

        login: (username, password) => api._request('/auth/login/', 'POST', { username, password }),
        register: (userData) => api._request('/auth/register/', 'POST', userData),
        getPatients: () => api._request('/patients/'),
        getDoctors: () => api._request('/doctors/'),
        addPatient: (patientData) => api._request('/patients/', 'POST', patientData),
        getRecommendations: (symptoms) => api._request('/symptom-checker/', 'POST', { symptoms }),
        createAssignment: (patientId, doctorId) => api._request("/mappings/", "POST", { patient_id: patientId, doctor_id: doctorId }),
        deleteAssignment: (assignmentId) => api._request(`/mappings/${assignmentId}/`, 'DELETE'),
    };

    // UI Layer: Handles all DOM manipulation and rendering
    const ui = {
        elements: {
            authView: document.getElementById('auth-view'),
            dashboardView: document.getElementById('dashboard-view'),
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            patientsList: document.getElementById('patients-list'),
            logoutButton: document.getElementById('logout-button'),
            addPatientBtn: document.getElementById('add-patient-btn'),
            addPatientModal: document.getElementById('add-patient-modal'),
            patientForm: document.getElementById('patient-form'),
            symptomForm: document.getElementById('symptom-form'),
            toggleAuthLink: document.getElementById('toggle-auth'),
            welcomeView: document.getElementById('welcome-view'),
            doctorRecommendationsView: document.getElementById('doctor-recommendations-view'),
            recommendedDoctorsList: document.getElementById('recommended-doctors-list'),
            assignDoctorModal: document.getElementById('assign-doctor-modal'),
            assignDoctorList: document.getElementById('assign-doctors-list'),
            analyzeBtnText: document.getElementById('analyze-btn-text'),
            analyzeSpinner: document.getElementById('analyze-spinner'),
            toastContainer: document.getElementById('toast-container'),
            doctorDetailModal: document.getElementById('doctor-detail-modal'),
            patientDetailModal: document.getElementById('patient-detail-modal'),
            assignFromDoctorBtn: document.getElementById('assign-from-doctor-btn'),
            patientSelectDropdown: document.getElementById('patient-select-dropdown'),
            resetViewBtn: document.getElementById('reset-view-btn'), // New selector
        },

        showToast(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            toast.className = `toast ${bgColor} text-white p-4 rounded-lg shadow-lg mb-2`;
            toast.textContent = message;
            this.elements.toastContainer.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                toast.addEventListener('transitionend', () => toast.remove());
            }, 3000);
        },
        
        toggleAuthForms() {
            const { loginForm, registerForm, toggleAuthLink } = this.elements;
            const isLoginHidden = loginForm.classList.contains('hidden');
            loginForm.classList.toggle('hidden', !isLoginHidden);
            registerForm.classList.toggle('hidden', isLoginHidden);
            document.getElementById('auth-title').textContent = isLoginHidden ? 'Login' : 'Register';
            document.getElementById('auth-subtitle').textContent = isLoginHidden ? 'Welcome back!' : 'Create a new account.';
            toggleAuthLink.textContent = isLoginHidden ? "Don't have an account? Register" : 'Already have an account? Login';
        },

        showDashboard(shouldShow) {
            this.elements.authView.classList.toggle('hidden', shouldShow);
            this.elements.dashboardView.classList.toggle('hidden', !shouldShow);
        },

        // UPGRADE: This function now handles both overall and filtered stats
        updateDashboardStats(filteredDoctors = null) {
            const doctorList = filteredDoctors || state.allDoctors;
            const doctorIds = new Set(doctorList.map(d => d.id));
            
            let relevantAssignments = 0;
            state.patients.forEach(patient => {
                patient.assignments.forEach(assignment => {
                    if (doctorIds.has(assignment.doctor.id)) {
                        relevantAssignments++;
                    }
                });
            });

            document.getElementById('total-patients-stat').textContent = state.patients.length;
            document.getElementById('total-doctors-stat').textContent = doctorList.length;
            document.getElementById('total-assignments-stat').textContent = relevantAssignments;
        },

        renderPatients() {
            this.elements.patientsList.innerHTML = '';
            if (!state.patients || state.patients.length === 0) {
                this.elements.patientsList.innerHTML = '<p class="text-gray-500">No patients found. Add one to get started!</p>';
                return;
            }
            state.patients.forEach(patient => {
                let assignedDoctorsHtml = '<p class="text-sm text-gray-500">No doctor assigned.</p>';
                if (patient.assignments && patient.assignments.length > 0) {
                    assignedDoctorsHtml = patient.assignments.map(a => `
                        <div class="flex items-center justify-between mt-2 p-2 bg-indigo-50 rounded-md">
                            <span class="text-indigo-800 font-semibold">${a.doctor.name}</span>
                            <button class="unassign-btn text-red-500 hover:text-red-700 font-bold" data-assignment-id="${a.id}" title="Unassign Doctor">×</button>
                        </div>`).join('');
                }
                const patientCard = document.createElement('div');
                patientCard.className = "p-4 bg-white border rounded-lg mb-2 shadow-sm";
                patientCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg cursor-pointer hover:text-indigo-600 patient-name" data-patient-id="${patient.id}">${patient.name}</h3>
                            <p class="text-sm text-gray-600">${patient.age}, ${patient.gender}</p>
                        </div>
                        <button class="assign-btn bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition" data-patient-id="${patient.id}" data-patient-name="${patient.name}">Assign Doctor</button>
                    </div>
                    <div class="mt-4"><h4 class="font-semibold text-sm">Assigned Doctor(s):</h4>${assignedDoctorsHtml}</div>`;
                this.elements.patientsList.appendChild(patientCard);
            });
            App.setupPatientCardListeners();
        },

        renderRecommendedDoctors() {
            this.elements.recommendedDoctorsList.innerHTML = '';
            if (!state.recommendedDoctors || state.recommendedDoctors.length === 0) {
                this.elements.recommendedDoctorsList.innerHTML = '<p class="text-gray-500">No doctors match the recommendation.</p>';
            } else {
                state.recommendedDoctors.forEach(doctor => {
                    const div = document.createElement('div');
                    div.className = "p-4 bg-white border rounded-lg mb-2 shadow-sm cursor-pointer hover:bg-gray-50 doctor-name";
                    div.setAttribute('data-doctor-id', doctor.id);
                    div.innerHTML = `<span class="font-bold text-lg">${doctor.name}</span> - <span class="text-gray-700">${doctor.specialization}</span>`;
                    this.elements.recommendedDoctorsList.appendChild(div);
                });
            }
            this.elements.welcomeView.classList.add('hidden');
            this.elements.doctorRecommendationsView.classList.remove('hidden');
            App.setupDoctorCardListeners();
        },
        
        resetDoctorView() {
            this.elements.welcomeView.classList.remove('hidden');
            this.elements.doctorRecommendationsView.classList.add('hidden');
            state.recommendedDoctors = [];
            this.updateDashboardStats(); // Reset stats to overall view
        },
        
        openModal(modalElement) {
            modalElement.classList.remove('hidden');
            modalElement.classList.add('flex');
        },

        closeModal(modalElement) {
            modalElement.classList.add('hidden');
            modalElement.classList.remove('flex');
        }
    };

    // Main Application Logic
    const App = {
        async init() {
            this.setupEventListeners();
            if (state.token) {
                ui.showDashboard(true);
                await this.loadInitialData();
            } else {
                ui.showDashboard(false);
            }
        },

        async loadInitialData() {
            try {
                const [patientsResponse, doctorsResponse] = await Promise.all([api.getPatients(), api.getDoctors()]);
                state.patients = patientsResponse.results || [];
                state.allDoctors = doctorsResponse || [];
                ui.renderPatients();
                ui.updateDashboardStats();
            } catch (error) {
                ui.showToast('Error loading initial data.', 'error');
            }
        },

        setupEventListeners() {
            ui.elements.loginForm.addEventListener('submit', this.handleLogin);
            ui.elements.registerForm.addEventListener('submit', this.handleRegister);
            ui.elements.logoutButton.addEventListener('click', this.handleLogout);
            ui.elements.toggleAuthLink.addEventListener('click', (e) => { e.preventDefault(); ui.toggleAuthForms(); });
            ui.elements.addPatientBtn.addEventListener('click', () => ui.openModal(ui.elements.addPatientModal));
            ui.elements.patientForm.addEventListener('submit', this.handleAddPatient);
            ui.elements.symptomForm.addEventListener('submit', this.handleSymptomCheck);
            ui.elements.assignFromDoctorBtn.addEventListener('click', this.handleAssignFromDoctor);
            ui.elements.resetViewBtn.addEventListener('click', () => ui.resetDoctorView()); // New listener
            document.querySelectorAll('.cancel-modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => ui.closeModal(e.target.closest('.fixed.inset-0')));
            });
        },

        setupPatientCardListeners() {
            document.querySelectorAll('.assign-btn').forEach(btn => btn.addEventListener('click', this.handleOpenAssignModal));
            document.querySelectorAll('.unassign-btn').forEach(btn => btn.addEventListener('click', this.handleUnassign));
            document.querySelectorAll('.patient-name').forEach(nameEl => nameEl.addEventListener('click', this.handleOpenPatientDetail));
        },
        
        setupDoctorCardListeners() {
            document.querySelectorAll('.doctor-name').forEach(nameEl => nameEl.addEventListener('click', this.handleOpenDoctorDetail));
        },

        async handleLogin(e) {
            e.preventDefault();
            const username = ui.elements.loginForm.querySelector('#login-username').value;
            const password = ui.elements.loginForm.querySelector('#login-password').value;
            try {
                const data = await api.login(username, password);
                state.token = data.access;
                localStorage.setItem('accessToken', state.token);
                ui.showDashboard(true);
                await App.loadInitialData();
            } catch (error) {
                ui.showToast('Login failed: ' + (error.detail || 'Unknown error'), 'error');
            }
        },

        async handleRegister(e) {
            e.preventDefault();
            const username = ui.elements.registerForm.querySelector('#reg-username').value;
            const email = ui.elements.registerForm.querySelector('#reg-email').value;
            const password = ui.elements.registerForm.querySelector('#reg-password').value;
            const userData = { username, email, password };
            try {
                await api.register(userData);
                ui.showToast('Registration successful! Please login.');
                ui.toggleAuthForms();
            } catch (error) {
                ui.showToast('Registration failed: ' + JSON.stringify(error), 'error');
            }
        },
        
        handleLogout() {
            state.token = null;
            localStorage.removeItem('accessToken');
            location.reload();
        },
        
        async handleAddPatient(e) {
            e.preventDefault();
            const newPatient = {
                name: ui.elements.patientForm.querySelector('#patient-name').value,
                age: ui.elements.patientForm.querySelector('#patient-age').value,
                gender: ui.elements.patientForm.querySelector('#patient-gender').value,
                phone: ui.elements.patientForm.querySelector('#patient-phone').value,
                address: ui.elements.patientForm.querySelector('#patient-address').value,
            };
            try {
                await api.addPatient(newPatient);
                ui.closeModal(ui.elements.addPatientModal);
                ui.showToast('Patient added successfully.');
                await App.loadInitialData();
            } catch (error) {
                ui.showToast('Error adding patient.', 'error');
            }
        },

        async handleSymptomCheck(e) {
            e.preventDefault();
            const symptoms = ui.elements.symptomForm.elements['symptoms-input'].value;
            if (!symptoms.trim()) {
                ui.showToast('Please describe your symptoms.', 'error');
                return;
            }
            ui.elements.analyzeBtnText.textContent = 'Analyzing...';
            ui.elements.analyzeSpinner.classList.remove('hidden');
            try {
                const data = await api.getRecommendations(symptoms);
                state.recommendedDoctors = data.recommended_doctors || [];
                ui.renderRecommendedDoctors();
                // UPGRADE: Update stats with the filtered list
                ui.updateDashboardStats(state.recommendedDoctors);
            } catch (error) {
                ui.showToast('Error getting recommendation.', 'error');
            } finally {
                ui.elements.analyzeBtnText.textContent = 'Analyze & Find Doctor';
                ui.elements.analyzeSpinner.classList.add('hidden');
            }
        },
        
        handleOpenAssignModal(e) {
            const { patientId, patientName } = e.target.dataset;
            ui.elements.assignDoctorList.innerHTML = '';
            const doctorsToDisplay = state.recommendedDoctors.length > 0 ? state.recommendedDoctors : state.allDoctors;
            if (doctorsToDisplay.length === 0) {
                ui.elements.assignDoctorList.innerHTML = '<p class="text-gray-500">No doctors available.</p>';
            } else {
                doctorsToDisplay.forEach(doctor => {
                    const li = document.createElement('li');
                    li.className = "doctor-item p-3 border rounded mb-2 cursor-pointer hover:bg-green-100 transition";
                    li.dataset.id = doctor.id;
                    li.innerHTML = `<div class="font-bold">${doctor.name}</div><div class="text-sm text-gray-600">${doctor.specialization}</div>`;
                    li.addEventListener('click', async () => {
                        try {
                            await api.createAssignment(patientId, doctor.id);
                            ui.closeModal(ui.elements.assignDoctorModal);
                            ui.showToast('Doctor assigned successfully.');
                            await App.loadInitialData();
                        } catch (error) {
                            ui.showToast(error.detail?.non_field_errors?.[0] || 'Error assigning doctor.', 'error');
                        }
                    });
                    ui.elements.assignDoctorList.appendChild(li);
                });
            }
            document.getElementById('assign-patient-name').textContent = patientName;
            ui.openModal(ui.elements.assignDoctorModal);
        },

        async handleUnassign(e) {
            const { assignmentId } = e.target.dataset;
            if (confirm('Are you sure you want to unassign this doctor?')) {
                try {
                    await api.deleteAssignment(assignmentId);
                    ui.showToast('Doctor unassigned successfully.');
                    await App.loadInitialData();
                } catch (error) {
                    ui.showToast('Error unassigning doctor.', 'error');
                }
            }
        },
        
        handleOpenDoctorDetail(e) {
            const { doctorId } = e.currentTarget.dataset;
            state.currentDoctorId = doctorId;
            const doctor = state.allDoctors.find(d => d.id == doctorId);
            if (!doctor) return;
            
            document.getElementById('doctor-detail-name').textContent = doctor.name;
            document.getElementById('doctor-detail-specialization').textContent = doctor.specialization;
            document.getElementById('doctor-detail-experience').textContent = doctor.experience_years;
            document.getElementById('doctor-detail-phone').textContent = doctor.phone || 'N/A';
            document.getElementById('doctor-detail-email').textContent = doctor.email || 'N/A';
            
            ui.elements.patientSelectDropdown.innerHTML = '';
            if (state.patients.length > 0) {
                state.patients.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                    option.textContent = p.name;
                    ui.elements.patientSelectDropdown.appendChild(option);
                });
            } else {
                ui.elements.patientSelectDropdown.innerHTML = '<option disabled>No patients available</option>';
            }
            ui.openModal(ui.elements.doctorDetailModal);
        },
        
        async handleAssignFromDoctor() {
            const patientId = ui.elements.patientSelectDropdown.value;
            if (!patientId || !state.currentDoctorId) {
                ui.showToast('Please select a patient.', 'error');
                return;
            }
            try {
                await api.createAssignment(patientId, state.currentDoctorId);
                ui.closeModal(ui.elements.doctorDetailModal);
                ui.showToast('Doctor assigned successfully.');
                await App.loadInitialData();
            } catch (error) {
                ui.showToast(error.detail?.non_field_errors?.[0] || 'Error assigning doctor.', 'error');
            }
        },
        
        handleOpenPatientDetail(e) {
            const { patientId } = e.currentTarget.dataset;
            const patient = state.patients.find(p => p.id == patientId);
            if (!patient) return;

            document.getElementById('patient-detail-name').textContent = patient.name;
            document.getElementById('patient-detail-age').textContent = patient.age;
            document.getElementById('patient-detail-gender').textContent = patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other';
            document.getElementById('patient-detail-phone').textContent = patient.phone || 'N/A';
            document.getElementById('patient-detail-address').textContent = patient.address || 'N/A';
            
            const assignmentsList = document.getElementById('patient-detail-assignments');
            assignmentsList.innerHTML = '';
            if (patient.assignments && patient.assignments.length > 0) {
                patient.assignments.forEach(a => {
                    const div = document.createElement('div');
                    div.className = 'p-2 bg-gray-100 rounded';
                    div.innerHTML = `<strong>${a.doctor.name}</strong> <span class="text-gray-600">(${a.doctor.specialization})</span>`;
                    assignmentsList.appendChild(div);
                });
            } else {
                assignmentsList.innerHTML = '<p class="text-gray-500">No assignment history.</p>';
            }
            ui.openModal(ui.elements.patientDetailModal);
        }
    };

    // --- Initialize the Application ---
    App.init();
});
