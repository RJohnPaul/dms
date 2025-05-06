import { showToast, validateInput } from './utilities.js';

// Mock user data for demo purposes
// In production, this would come from a database
const mockUsers = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        fullName: 'Admin User',
        email: 'admin@example.com',
        phone: '+1234567890',
        role: 'admin',
        status: 'active',
        permissions: ['all']
    },
    {
        id: 2,
        username: 'volunteer1',
        password: 'pass123',
        fullName: 'John Volunteer',
        email: 'john@example.com',
        phone: '+1234567891',
        role: 'volunteer',
        status: 'active',
        permissions: ['view_camps', 'manage_requests', 'view_donations']
    },
    {
        id: 3,
        username: 'donor1',
        password: 'pass123',
        fullName: 'Jane Donor',
        email: 'jane@example.com',
        phone: '+1234567892',
        role: 'donor',
        status: 'active',
        permissions: ['manage_donations', 'view_requests']
    },
    {
        id: 4,
        username: 'user1',
        password: 'pass123',
        fullName: 'Sam User',
        email: 'sam@example.com',
        phone: '+1234567893',
        role: 'user',
        status: 'active',
        permissions: ['report_incident', 'view_requests', 'view_camps']
    },
    {
        id: 5,
        username: 'driver1',
        password: 'pass123',
        fullName: 'David Driver',
        email: 'david@example.com',
        phone: '+1234567894',
        role: 'driver',
        status: 'active',
        permissions: ['manage_logistics', 'view_camps']
    },
    {
        id: 6,
        username: 'beneficiary1',
        password: 'pass123',
        fullName: 'Sarah Beneficiary',
        email: 'sarah@example.com',
        phone: '+1234567895',
        role: 'beneficiary',
        status: 'active',
        permissions: ['request_aid', 'view_camps']
    }
];

// Role permissions mapping
const rolePermissions = {
    admin: [
        'all', 
        'manage_users', 
        'approve_users', 
        'manage_camps', 
        'manage_requests',
        'manage_donations', 
        'manage_logistics', 
        'view_reports', 
        'export_data'
    ],
    volunteer: [
        'view_camps', 
        'manage_requests', 
        'view_donations', 
        'update_camps',
        'view_logistics'
    ],
    donor: [
        'manage_donations', 
        'view_requests', 
        'view_camps'
    ],
    user: [
        'report_incident', 
        'view_requests', 
        'view_camps'
    ],
    driver: [
        'manage_logistics', 
        'view_camps', 
        'update_logistics'
    ],
    beneficiary: [
        'request_aid', 
        'view_camps', 
        'view_donations'
    ]
};

// Initialize the auth module
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser && window.location.pathname.includes('login.html')) {
        // Redirect to dashboard if already logged in
        window.location.href = 'index.html';
    } else if (!currentUser && !window.location.pathname.includes('login.html')) {
        // Redirect to login if not logged in and trying to access protected pages
        // Skip redirect for pages that don't require auth
        const publicPages = ['login.html'];
        const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
        
        if (!isPublicPage) {
            window.location.href = 'login.html';
        }
    }

    // Initialize login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Initialize register modal
    const registerLink = document.getElementById('register-link');
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.querySelector('.cancel-btn');

    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            registerModal.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            registerModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Initialize logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Update UI based on user role if user is logged in
    if (currentUser) {
        updateUIForRole(currentUser.role);
    }
});

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorElement = document.getElementById('login-error');
    
    // Validate inputs
    if (!validateInput(username, 'Username is required') || 
        !validateInput(password, 'Password is required') ||
        !validateInput(role, 'Role is required')) {
        
        errorElement.textContent = 'Please fill all required fields';
        errorElement.style.display = 'block';
        return;
    }

    // Authenticate user
    const user = mockUsers.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );

    if (!user) {
        errorElement.textContent = 'Invalid username, password, or role. Please try again.';
        errorElement.style.display = 'block';
        return;
    }

    if (user.status !== 'active') {
        errorElement.textContent = 'Your account is not active. Please contact an administrator.';
        errorElement.style.display = 'block';
        return;
    }

    // Login successful
    const userToStore = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions
    };

    // Save user info to localStorage
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    
    // Redirect to dashboard
    window.location.href = 'index.html';
}

// Handle user registration
function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('register-fullname').value;
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const role = document.getElementById('register-role').value;
    
    // Validate inputs
    if (!validateInput(fullName, 'Full name is required') || 
        !validateInput(username, 'Username is required') ||
        !validateInput(email, 'Email is required') ||
        !validateInput(phone, 'Phone is required') ||
        !validateInput(password, 'Password is required') ||
        !validateInput(confirmPassword, 'Confirm password is required') ||
        !validateInput(role, 'Role is required')) {
        
        showToast('Please fill all required fields', 'error');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    // Check if username already exists
    if (mockUsers.some(u => u.username === username)) {
        showToast('Username already exists', 'error');
        return;
    }

    // In a real application, you'd send this data to your server
    // For demo purposes, we'll just show a success message
    showToast('Registration successful! Please wait for admin approval.', 'success');
    
    // Close the modal
    document.getElementById('register-modal').style.display = 'none';
    
    // Reset the form
    document.getElementById('register-form').reset();
}

// Handle logout
function handleLogout(event) {
    event.preventDefault();
    
    // Clear user data
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Get current user from localStorage
export function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Check if current user has specific permission
export function hasPermission(permission) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return false;
    }
    
    if (currentUser.role === 'admin' || currentUser.permissions.includes('all')) {
        return true;
    }
    
    return currentUser.permissions.includes(permission);
}

// Update UI elements based on user role and permissions
function updateUIForRole(role) {
    // Add role-specific class to body
    document.body.classList.add(`role-${role}`);
    
    // Update sidebar color based on role
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        // The CSS already handles this with .role-{rolename} .sidebar styling
    }
    
    // Update user info in the sidebar
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userNameElement = document.querySelector('.user-info h4');
        const userRoleElement = document.querySelector('.user-info small');
        
        if (userNameElement) {
            userNameElement.textContent = currentUser.fullName;
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        }
    }
    
    // Hide elements based on permissions
    const permissionElements = document.querySelectorAll('[data-requires-permission]');
    permissionElements.forEach(element => {
        const requiredPermission = element.getAttribute('data-requires-permission');
        if (!hasPermission(requiredPermission)) {
            element.style.display = 'none';
        }
    });
    
    // Hide nav links based on permissions
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(li => {
        const link = li.querySelector('a');
        if (link && link.getAttribute('data-requires-permission')) {
            const requiredPermission = link.getAttribute('data-requires-permission');
            if (!hasPermission(requiredPermission)) {
                li.style.display = 'none';
            }
        }
    });
}

// For admin: approve pending users
export function approveUser(userId) {
    // In a real application, this would send a request to your server
    // For demo purposes, we'll just show a success message
    showToast('User approved successfully', 'success');
}

// For admin: reject pending users
export function rejectUser(userId) {
    // In a real application, this would send a request to your server
    // For demo purposes, we'll just show a success message
    showToast('User rejected', 'info');
}

// Role-based access check
export function checkRoleAccess(requiredRoles) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return false;
    }
    
    if (currentUser.role === 'admin') {
        return true; // Admin has access to everything
    }
    
    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(currentUser.role);
    }
    
    return currentUser.role === requiredRoles;
}