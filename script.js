// Database simulation using localStorage
class Database {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('medistock_users')) || [];
        this.medicines = JSON.parse(localStorage.getItem('medistock_medicines')) || [];
        this.sales = JSON.parse(localStorage.getItem('medistock_sales')) || [];
        this.customers = JSON.parse(localStorage.getItem('medistock_customers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('medistock_currentUser')) || null;
    }

    saveUsers() {
        localStorage.setItem('medistock_users', JSON.stringify(this.users));
    }

    saveMedicines() {
        localStorage.setItem('medistock_medicines', JSON.stringify(this.medicines));
    }

    saveSales() {
        localStorage.setItem('medistock_sales', JSON.stringify(this.sales));
    }

    saveCustomers() {
        localStorage.setItem('medistock_customers', JSON.stringify(this.customers));
    }

    saveCurrentUser() {
        localStorage.setItem('medistock_currentUser', JSON.stringify(this.currentUser));
    }

    // User methods
    registerUser(userData) {
        const user = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            verified: false
        };
        this.users.push(user);
        this.saveUsers();
        return user;
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            this.saveCurrentUser();
        }
        return user;
    }

    logoutUser() {
        this.currentUser = null;
        this.saveCurrentUser();
    }

    updateUser(userId, userData) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...userData };
            this.saveUsers();
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = this.users[index];
                this.saveCurrentUser();
            }
            return this.users[index];
        }
        return null;
    }

    // Medicine methods
    addMedicine(medicineData) {
        const medicine = {
            id: Date.now().toString(),
            ...medicineData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.medicines.push(medicine);
        this.saveMedicines();
        return medicine;
    }

    getMedicines() {
        return this.medicines.filter(m => m.userId === this.currentUser.id);
    }

    updateMedicine(medicineId, medicineData) {
        const index = this.medicines.findIndex(m => m.id === medicineId);
        if (index !== -1) {
            this.medicines[index] = { 
                ...this.medicines[index], 
                ...medicineData,
                updatedAt: new Date().toISOString()
            };
            this.saveMedicines();
            return this.medicines[index];
        }
        return null;
    }

    deleteMedicine(medicineId) {
        const index = this.medicines.findIndex(m => m.id === medicineId);
        if (index !== -1) {
            this.medicines.splice(index, 1);
            this.saveMedicines();
            return true;
        }
        return false;
    }

    // Sales methods
    addSale(saleData) {
        const sale = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            ...saleData,
            createdAt: new Date().toISOString()
        };
        this.sales.push(sale);
        this.saveSales();
        return sale;
    }

    getSales() {
        return this.sales.filter(s => s.userId === this.currentUser.id);
    }

    // Customer methods
    addCustomer(customerData) {
        const customer = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            ...customerData,
            createdAt: new Date().toISOString()
        };
        this.customers.push(customer);
        this.saveCustomers();
        return customer;
    }

    getCustomers() {
        return this.customers.filter(c => c.userId === this.currentUser.id);
    }
}

// Main Application
class MediStockApp {
    constructor() {
        this.db = new Database();
        this.initElements();
        this.initEventListeners();
        this.checkAuth();
    }

    initElements() {
        // Auth Pages
        this.loginPage = document.getElementById('login-page');
        this.loginForm = document.getElementById('login-form');
        this.forgotPasswordPage = document.getElementById('forgot-password-page');
        this.forgotPasswordForm = document.getElementById('forgot-password-form');
        this.otpPage = document.getElementById('otp-page');
        this.otpForm = document.getElementById('otp-form');
        this.registerPage = document.getElementById('register-page');
        this.registerForm = document.getElementById('register-form');
        
        // Main App
        this.app = document.getElementById('app');
        this.sidebar = document.getElementById('sidebar');
        this.toggleSidebarBtn = document.getElementById('toggle-sidebar');
        this.mainContent = document.getElementById('main-content');
        this.logoutBtn = document.getElementById('logout-btn');
        
        // Pages
        this.pages = {
            dashboard: document.getElementById('dashboard-page'),
            profile: document.getElementById('profile-page'),
            stock: document.getElementById('stock-page'),
            sales: document.getElementById('sales-page'),
            customers: document.getElementById('customers-page'),
            reports: document.getElementById('reports-page'),
            payment: document.getElementById('payment-page')
        };
        
        // Profile Page
        this.profileView = document.getElementById('profile-view');
        this.profileEdit = document.getElementById('profile-edit');
        this.editProfileBtn = document.getElementById('edit-profile-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.profileForm = document.getElementById('profile-form');
        
        // Stock Page
        this.addMedicineBtn = document.getElementById('add-medicine-btn');
        this.addMedicineForm = document.getElementById('add-medicine-form');
        this.stockTable = document.getElementById('stock-table').querySelector('tbody');
        this.medicineSelect = document.getElementById('medicine-select');
        this.medicineQty = document.getElementById('medicine-qty');
        this.addToCartBtn = document.getElementById('add-to-cart');
        this.cartTable = document.getElementById('cart-table').querySelector('tbody');
        this.clearCartBtn = document.getElementById('clear-cart');
        this.sellMedicineForm = document.getElementById('sell-medicine-form');
        
        // Dashboard Elements
        this.totalMedicinesEl = document.getElementById('total-medicines');
        this.todaySalesEl = document.getElementById('today-sales');
        this.monthlyRevenueEl = document.getElementById('monthly-revenue');
        this.expiringSoonEl = document.getElementById('expiring-soon');
        this.recentSalesTable = document.getElementById('recent-sales-table').querySelector('tbody');
        this.lowStockTable = document.getElementById('low-stock-table').querySelector('tbody');
    }

    initEventListeners() {
        // Auth Event Listeners
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-link').addEventListener('click', (e) => this.showRegisterPage(e));
        document.getElementById('login-link').addEventListener('click', (e) => this.showLoginPage(e));
        document.getElementById('forgot-password-btn').addEventListener('click', (e) => this.showForgotPasswordPage(e));
        document.getElementById('back-to-login').addEventListener('click', (e) => this.showLoginPage(e));
        this.forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Main App Event Listeners
        this.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Profile Event Listeners
        this.editProfileBtn.addEventListener('click', () => this.showProfileEdit());
        this.cancelEditBtn.addEventListener('click', () => this.showProfileView());
        this.profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        
        // Stock Event Listeners
        this.addMedicineForm.addEventListener('submit', (e) => this.handleAddMedicine(e));
        this.addToCartBtn.addEventListener('click', () => this.addToCart());
        this.clearCartBtn.addEventListener('click', () => this.clearCart());
        this.sellMedicineForm.addEventListener('submit', (e) => this.handleSellMedicine(e));
        
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
        
        // Sidebar links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToPage(e, link));
        });
    }

    checkAuth() {
        if (this.db.currentUser) {
            this.showApp();
            this.loadDashboard();
            this.loadProfile();
            this.loadMedicines();
        } else {
            this.showLoginPage();
        }
    }

    showLoginPage(e) {
        if (e) e.preventDefault();
        this.loginPage.classList.remove('hidden');
        this.forgotPasswordPage.classList.add('hidden');
        this.otpPage.classList.add('hidden');
        this.registerPage.classList.add('hidden');
        this.app.classList.add('hidden');
    }

    showForgotPasswordPage(e) {
        e.preventDefault();
        this.loginPage.classList.add('hidden');
        this.forgotPasswordPage.classList.remove('hidden');
    }

    showRegisterPage(e) {
        e.preventDefault();
        this.loginPage.classList.add('hidden');
        this.registerPage.classList.remove('hidden');
    }

    showApp() {
        this.loginPage.classList.add('hidden');
        this.forgotPasswordPage.classList.add('hidden');
        this.otpPage.classList.add('hidden');
        this.registerPage.classList.add('hidden');
        this.app.classList.remove('hidden');
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('open');
    }

    navigateToPage(e, link) {
        e.preventDefault();
        
        // Update active state
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Hide all pages
        Object.values(this.pages).forEach(page => page.classList.add('hidden'));
        
        // Show selected page
        const pageId = link.getAttribute('data-page') + '-page';
        this.pages[link.getAttribute('data-page')].classList.remove('hidden');
        
        // Load page data
        switch(link.getAttribute('data-page')) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'stock':
                this.loadMedicines();
                break;
            case 'sales':
                this.loadSales();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'payment':
                // No special loading needed
                break;
        }
    }

    switchTab(btn) {
        const tabContainer = btn.closest('.tab-container');
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Hide all tab panes
        tabContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Show selected tab pane
        tabContainer.querySelector(`#${tabId}`).classList.add('active');
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const user = this.db.loginUser(email, password);
        if (user) {
            this.showApp();
            this.loadDashboard();
            this.loadProfile();
            this.loadMedicines();
        } else {
            alert('Invalid email or password');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        
        const userData = {
            firstName: document.getElementById('first-name').value,
            middleName: document.getElementById('middle-name').value,
            lastName: document.getElementById('last-name').value,
            businessName: document.getElementById('business-name').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            street: document.getElementById('street').value,
            pincode: document.getElementById('pincode').value,
            email: document.getElementById('register-email').value,
            phone: document.getElementById('phone').value,
            altPhone: document.getElementById('alt-phone').value,
            gst: document.getElementById('gst').value,
            aadhar: document.getElementById('aadhar').value,
            pan: document.getElementById('pan').value,
            drugLicense: document.getElementById('drug-license').value,
            password: document.getElementById('register-password').value
        };
        
        if (userData.password !== document.getElementById('confirm-register-password').value) {
            alert('Passwords do not match');
            return;
        }
        
        this.db.registerUser(userData);
        alert('Registration successful! Please login.');
        this.showLoginPage();
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real app, we would send an OTP to the email
        // For this demo, we'll just show the OTP page
        this.forgotPasswordPage.classList.add('hidden');
        this.otpPage.classList.remove('hidden');
    }

    handleLogout() {
        this.db.logoutUser();
        this.showLoginPage();
    }

    showProfileView() {
        this.profileView.classList.remove('hidden');
        this.profileEdit.classList.add('hidden');
    }

    showProfileEdit() {
        this.profileView.classList.add('hidden');
        this.profileEdit.classList.remove('hidden');
        
        // Populate form with current user data
        const user = this.db.currentUser;
        document.getElementById('edit-first-name').value = user.firstName;
        document.getElementById('edit-middle-name').value = user.middleName || '';
        document.getElementById('edit-last-name').value = user.lastName;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-phone').value = user.phone;
        document.getElementById('edit-alt-phone').value = user.altPhone || '';
        document.getElementById('edit-business-name').value = user.businessName;
        document.getElementById('edit-country').value = user.country;
        document.getElementById('edit-city').value = user.city;
        document.getElementById('edit-state').value = user.state;
        document.getElementById('edit-street').value = user.street;
        document.getElementById('edit-pincode').value = user.pincode;
        document.getElementById('edit-gst').value = user.gst;
        document.getElementById('edit-pan').value = user.pan;
        document.getElementById('edit-license').value = user.drugLicense;
    }

    handleProfileUpdate(e) {
        e.preventDefault();
        
        const userData = {
            firstName: document.getElementById('edit-first-name').value,
            middleName: document.getElementById('edit-middle-name').value,
            lastName: document.getElementById('edit-last-name').value,
            email: document.getElementById('edit-email').value,
            phone: document.getElementById('edit-phone').value,
            altPhone: document.getElementById('edit-alt-phone').value,
            businessName: document.getElementById('edit-business-name').value,
            country: document.getElementById('edit-country').value,
            city: document.getElementById('edit-city').value,
            state: document.getElementById('edit-state').value,
            street: document.getElementById('edit-street').value,
            pincode: document.getElementById('edit-pincode').value,
            gst: document.getElementById('edit-gst').value,
            pan: document.getElementById('edit-pan').value,
            drugLicense: document.getElementById('edit-license').value
        };
        
        this.db.updateUser(this.db.currentUser.id, userData);
        this.loadProfile();
        this.showProfileView();
        alert('Profile updated successfully!');
    }

    loadDashboard() {
        const medicines = this.db.getMedicines();
        const sales = this.db.getSales();
        
        // Update dashboard cards
        this.totalMedicinesEl.textContent = medicines.length;
        
        const todaySales = sales
            .filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        this.todaySalesEl.textContent = `₹${todaySales.toFixed(2)}`;
        
        const currentMonthSales = sales
            .filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth())
            .reduce((sum, sale) => sum + sale.totalAmount, 0);
        this.monthlyRevenueEl.textContent = `₹${currentMonthSales.toFixed(2)}`;
        
        const expiringSoon = medicines.filter(m => {
            const expDate = new Date(m.expDate);
            const today = new Date();
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30 && diffDays >= 0;
        }).length;
        this.expiringSoonEl.textContent = expiringSoon;
        
        // Update recent sales table
        this.recentSalesTable.innerHTML = '';
        const recentSales = sales.slice(0, 5).map(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>${sale.customerName}</td>
                <td>${sale.items.length}</td>
                <td>₹${sale.totalAmount.toFixed(2)}</td>
                <td><span class="badge badge-success">Completed</span></td>
            `;
            return row;
        });
        recentSales.forEach(row => this.recentSalesTable.appendChild(row));
        
        // Update low stock table
        this.lowStockTable.innerHTML = '';
        const lowStock = medicines.filter(m => m.quantity < 10).slice(0, 5);
        lowStock.forEach(medicine => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${medicine.medicineName}</td>
                <td>${medicine.batchNo}</td>
                <td>${medicine.quantity}</td>
                <td>${new Date(medicine.expDate).toLocaleDateString()}</td>
                <td><button class="btn btn-primary btn-sm">Reorder</button></td>
            `;
            this.lowStockTable.appendChild(row);
        });
        
        // Set current date
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    loadProfile() {
        const user = this.db.currentUser;
        
        document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('profile-phone').textContent = user.phone;
        document.getElementById('profile-alt-phone').textContent = user.altPhone || 'N/A';
        document.getElementById('profile-business').textContent = user.businessName;
        document.getElementById('profile-address').textContent = 
            `${user.street}, ${user.city}, ${user.state}, ${user.country} - ${user.pincode}`;
        document.getElementById('profile-gst').textContent = user.gst;
        document.getElementById('profile-pan').textContent = user.pan;
        document.getElementById('profile-license').textContent = user.drugLicense;
    }

    loadMedicines() {
        const medicines = this.db.getMedicines();
        this.stockTable.innerHTML = '';
        
        medicines.forEach(medicine => {
            const row = document.createElement('tr');
            
            // Check if medicine is expired or expiring soon
            const expDate = new Date(medicine.expDate);
            const today = new Date();
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                row.classList.add('expired-medicine');
            } else if (diffDays <= 30) {
                row.classList.add('expiring-soon');
            }
            
            row.innerHTML = `
                <td>${medicine.batchNo}</td>
                <td>${medicine.medicineName}</td>
                <td>${medicine.manufacturer}</td>
                <td>${medicine.category}</td>
                <td>${medicine.quantity}</td>
                <td>₹${medicine.mrp.toFixed(2)}</td>
                <td>${new Date(medicine.expDate).toLocaleDateString()}</td>
                <td>
                    ${diffDays < 0 ? '<span class="badge badge-danger">Expired</span>' : 
                      diffDays <= 30 ? '<span class="badge badge-warning">Expiring Soon</span>' : 
                      '<span class="badge badge-success">Good</span>'}
                </td>
                <td>
                    <button class="btn btn-primary btn-sm edit-medicine" data-id="${medicine.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-medicine" data-id="${medicine.id}">Delete</button>
                </td>
            `;
            this.stockTable.appendChild(row);
        });
        
        // Populate medicine select for selling
        this.medicineSelect.innerHTML = '<option value="">Select Medicine</option>';
        medicines.filter(m => {
            const expDate = new Date(m.expDate);
            return expDate > new Date(); // Only show non-expired medicines
        }).forEach(medicine => {
            const option = document.createElement('option');
            option.value = medicine.id;
            option.textContent = `${medicine.medicineName} (${medicine.batchNo}) - ₹${medicine.mrp.toFixed(2)}`;
            this.medicineSelect.appendChild(option);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-medicine').forEach(btn => {
            btn.addEventListener('click', () => this.editMedicine(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-medicine').forEach(btn => {
            btn.addEventListener('click', () => this.deleteMedicine(btn.getAttribute('data-id')));
        });
    }

    handleAddMedicine(e) {
        e.preventDefault();
        
        const medicineData = {
            userId: this.db.currentUser.id,
            batchNo: document.getElementById('batch-no').value,
            medicineName: document.getElementById('medicine-name').value,
            manufacturer: document.getElementById('manufacturer').value,
            category: document.getElementById('category').value,
            mfgDate: document.getElementById('mfg-date').value,
            expDate: document.getElementById('exp-date').value,
            buyingDate: document.getElementById('buying-date').value,
            mrp: parseFloat(document.getElementById('mrp').value),
            discount: parseFloat(document.getElementById('discount').value) || 0,
            sellerId: document.getElementById('seller-id').value,
            sellerName: document.getElementById('seller-name').value,
            quantity: parseInt(document.getElementById('quantity').value),
            type: document.getElementById('medicine-type').value
        };
        
        this.db.addMedicine(medicineData);
        alert('Medicine added successfully!');
        this.loadMedicines();
        this.addMedicineForm.reset();
    }

    editMedicine(medicineId) {
        const medicine = this.db.medicines.find(m => m.id === medicineId);
        if (!medicine) return;
        
        // Populate the form
        document.getElementById('batch-no').value = medicine.batchNo;
        document.getElementById('medicine-name').value = medicine.medicineName;
        document.getElementById('manufacturer').value = medicine.manufacturer;
        document.getElementById('category').value = medicine.category;
        document.getElementById('mfg-date').value = medicine.mfgDate;
        document.getElementById('exp-date').value = medicine.expDate;
        document.getElementById('buying-date').value = medicine.buyingDate;
        document.getElementById('mrp').value = medicine.mrp;
        document.getElementById('discount').value = medicine.discount;
        document.getElementById('seller-id').value = medicine.sellerId;
        document.getElementById('seller-name').value = medicine.sellerName;
        document.getElementById('quantity').value = medicine.quantity;
        document.getElementById('medicine-type').value = medicine.type;
        
        // Switch to add medicine tab
        document.querySelector('.tab-btn[data-tab="add-stock"]').click();
        
        // Change button text
        const submitBtn = this.addMedicineForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Update Medicine';
        
        // Store the medicine ID in the form
        this.addMedicineForm.dataset.medicineId = medicineId;
    }

    deleteMedicine(medicineId) {
        if (confirm('Are you sure you want to delete this medicine?')) {
            if (this.db.deleteMedicine(medicineId)) {
                alert('Medicine deleted successfully!');
                this.loadMedicines();
            }
        }
    }

    addToCart() {
        const medicineId = this.medicineSelect.value;
        const quantity = parseInt(this.medicineQty.value) || 1;
        
        if (!medicineId) {
            alert('Please select a medicine');
            return;
        }
        
        const medicine = this.db.medicines.find(m => m.id === medicineId);
        if (!medicine) return;
        
        // Check if already in cart
        const existingRow = this.cartTable.querySelector(`tr[data-id="${medicineId}"]`);
        if (existingRow) {
            const existingQty = parseInt(existingRow.querySelector('.cart-qty').textContent);
            const newQty = existingQty + quantity;
            
            if (newQty > medicine.quantity) {
                alert(`Only ${medicine.quantity} available in stock`);
                return;
            }
            
            existingRow.querySelector('.cart-qty').textContent = newQty;
            const total = (medicine.mrp * newQty).toFixed(2);
            existingRow.querySelector('.cart-total').textContent = `₹${total}`;
        } else {
            if (quantity > medicine.quantity) {
                alert(`Only ${medicine.quantity} available in stock`);
                return;
            }
            
            const row = document.createElement('tr');
            row.dataset.id = medicineId;
            row.innerHTML = `
                <td>${medicine.medicineName} (${medicine.batchNo})</td>
                <td>${medicine.batchNo}</td>
                <td>${new Date(medicine.expDate).toLocaleDateString()}</td>
                <td>₹${medicine.mrp.toFixed(2)}</td>
                <td class="cart-qty">${quantity}</td>
                <td class="cart-total">₹${(medicine.mrp * quantity).toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm remove-item">Remove</button></td>
            `;
            this.cartTable.appendChild(row);
            
            // Add event listener for remove button
            row.querySelector('.remove-item').addEventListener('click', () => row.remove());
        }
        
        this.updateCartSummary();
    }

    clearCart() {
        this.cartTable.innerHTML = '';
        this.updateCartSummary();
    }

    updateCartSummary() {
        const rows = this.cartTable.querySelectorAll('tr');
        let totalItems = 0;
        let subtotal = 0;
        
        rows.forEach(row => {
            const qty = parseInt(row.querySelector('.cart-qty').textContent);
            const price = parseFloat(row.querySelector('.cart-total').textContent.replace('₹', ''));
            
            totalItems += qty;
            subtotal += price;
        });
        
        const tax = subtotal * 0.05; // 5% tax
        const totalAmount = subtotal + tax;
        
        document.getElementById('total-items').textContent = totalItems;
        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('total-amount').textContent = `₹${totalAmount.toFixed(2)}`;
    }

    handleSellMedicine(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerEmail = document.getElementById('customer-email').value;
        
        if (!customerName || !customerPhone) {
            alert('Customer name and phone are required');
            return;
        }
        
        const rows = this.cartTable.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('Please add medicines to sell');
            return;
        }
        
        // Prepare sale data
        const items = [];
        let totalAmount = 0;
        
        rows.forEach(row => {
            const medicineId = row.dataset.id;
            const medicine = this.db.medicines.find(m => m.id === medicineId);
            const qty = parseInt(row.querySelector('.cart-qty').textContent);
            const price = parseFloat(row.querySelector('.cart-total').textContent.replace('₹', ''));
            
            items.push({
                medicineId,
                medicineName: medicine.medicineName,
                batchNo: medicine.batchNo,
                quantity: qty,
                price: price / qty,
                total: price
            });
            
            totalAmount += price;
            
            // Update medicine quantity in database
            this.db.updateMedicine(medicineId, {
                quantity: medicine.quantity - qty
            });
        });
        
        // Add customer if not exists
        let customer = this.db.customers.find(c => 
            c.phone === customerPhone && c.userId === this.db.currentUser.id);
        
        if (!customer) {
            customer = this.db.addCustomer({
                name: customerName,
                phone: customerPhone,
                email: customerEmail
            });
        }
        
        // Record sale
        this.db.addSale({
            customerId: customer.id,
            customerName,
            customerPhone,
            items,
            totalAmount,
            tax: totalAmount * 0.05
        });
        
        alert('Sale completed successfully!');
        this.clearCart();
        this.sellMedicineForm.reset();
        this.loadDashboard();
        this.loadMedicines();
    }

    loadSales() {
        const sales = this.db.getSales();
        const salesTable = document.getElementById('sales-table').querySelector('tbody');
        salesTable.innerHTML = '';
        
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(sale.createdAt).toLocaleDateString()}</td>
                <td>INV-${sale.id.slice(-6)}</td>
                <td>${sale.customerName}</td>
                <td>${sale.items.length}</td>
                <td>₹${sale.totalAmount.toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary btn-sm view-sale" data-id="${sale.id}">View</button>
                </td>
            `;
            salesTable.appendChild(row);
        });
    }

    loadCustomers() {
        const customers = this.db.getCustomers();
        const customersTable = document.getElementById('customers-table').querySelector('tbody');
        customersTable.innerHTML = '';
        
        customers.forEach(customer => {
            // Count purchases for this customer
            const purchaseCount = this.db.sales.filter(s => 
                s.customerId === customer.id).length;
            
            // Find last purchase date
            const lastPurchase = this.db.sales
                .filter(s => s.customerId === customer.id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${purchaseCount}</td>
                <td>${lastPurchase ? new Date(lastPurchase.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-primary btn-sm view-customer" data-id="${customer.id}">View</button>
                </td>
            `;
            customersTable.appendChild(row);
        });
    }

    loadReports() {
        const medicines = this.db.getMedicines();
        const sales = this.db.getSales();
        
        // Update report cards
        document.getElementById('total-revenue').textContent = 
            `₹${sales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`;
        
        document.getElementById('medicines-sold').textContent = 
            sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        document.getElementById('expired-medicines').textContent = 
            medicines.filter(m => new Date(m.expDate) < new Date()).length;
        
        // Count repeat customers (more than 1 purchase)
        const customerPurchaseCounts = {};
        sales.forEach(sale => {
            customerPurchaseCounts[sale.customerId] = (customerPurchaseCounts[sale.customerId] || 0) + 1;
        });
        
        document.getElementById('repeat-customers').textContent = 
            Object.values(customerPurchaseCounts).filter(count => count > 1).length;
        
        // Update expired medicines table
        const expiredTable = document.getElementById('expired-medicines-table').querySelector('tbody');
        expiredTable.innerHTML = '';
        
        medicines
            .filter(m => new Date(m.expDate) < new Date())
            .forEach(medicine => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${medicine.medicineName}</td>
                    <td>${medicine.batchNo}</td>
                    <td>${medicine.quantity}</td>
                    <td>${new Date(medicine.expDate).toLocaleDateString()}</td>
                    <td>₹${(medicine.mrp * 0.8 * medicine.quantity).toFixed(2)}</td>
                `;
                expiredTable.appendChild(row);
            });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MediStockApp();
});