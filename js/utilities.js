// Utilities module for the Disaster Management System
// Contains reusable helper functions for UI, data handling, and API requests

/**
 * Makes an API request to the backend
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Optional data to send with the request
 * @returns {Promise<any>} Response data from the API
 */
export async function apiRequest(url, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        // For demo purposes, let's simulate API calls if no backend is available
        if (!url.startsWith('http')) {
            return simulateApiResponse(url, method, data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Simulate API responses for development without a backend
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @returns {Promise<any>} Simulated response data
 */
function simulateApiResponse(url, method, data) {
    return new Promise((resolve) => {
        // Add delay to simulate network request
        setTimeout(() => {
            // Parse the URL to determine the endpoint
            const endpoint = url.split('/').slice(2).join('/');
            
            // Return mock data based on the endpoint and method
            if (endpoint === 'dashboard/stats') {
                resolve({
                    activeIncidents: 12,
                    totalCamps: 6,
                    totalDonors: 38,
                    pendingRequests: 7
                });
            } else if (endpoint === 'incidents' && method === 'GET') {
                resolve([
                    {
                        id: 1,
                        description: 'Flooding in the camp area',
                        camp_id: 1,
                        camp_name: 'Camp Alpha',
                        severity: 'High',
                        reported_by: 'Alice Johnson',
                        status: 'Active',
                        created_at: new Date(2025, 3, 27, 8, 30)
                    },
                    {
                        id: 2,
                        description: 'Shortage of medical supplies',
                        camp_id: 2,
                        camp_name: 'Camp Beta',
                        severity: 'Medium',
                        reported_by: 'Bob Smith',
                        status: 'Active',
                        created_at: new Date(2025, 3, 26, 14, 15)
                    },
                    {
                        id: 3,
                        description: 'Minor fire outbreak in the kitchen',
                        camp_id: 3,
                        camp_name: 'Camp Gamma',
                        severity: 'Low',
                        reported_by: 'Charlie Davis',
                        status: 'Resolved',
                        created_at: new Date(2025, 3, 25, 17, 45)
                    }
                ]);
            } else if (endpoint.startsWith('incidents/') && method === 'GET') {
                const incidentId = parseInt(endpoint.split('/')[1]);
                resolve({
                    id: incidentId,
                    description: 'Flooding in the camp area',
                    camp_id: 1,
                    camp_name: 'Camp Alpha',
                    severity: 'High',
                    reported_by: 'Alice Johnson',
                    status: 'Active',
                    needs_medical: true,
                    needs_evacuation: false,
                    created_at: new Date(2025, 3, 27, 8, 30)
                });
            } else if (endpoint === 'camps' && method === 'GET') {
                resolve([
                    {
                        id: 1,
                        name: 'Camp Alpha',
                        location: 'New York',
                        capacity: 1000,
                        current_occupancy: 500,
                        resources: {
                            food: 75,
                            water: 60,
                            medical: 35
                        },
                        status: 'Active',
                        created_at: new Date(2025, 3, 20)
                    },
                    {
                        id: 2,
                        name: 'Camp Beta',
                        location: 'Los Angeles',
                        capacity: 800,
                        current_occupancy: 300,
                        resources: {
                            food: 85,
                            water: 90,
                            medical: 50
                        },
                        status: 'Active',
                        created_at: new Date(2025, 3, 22)
                    },
                    {
                        id: 3,
                        name: 'Camp Gamma',
                        location: 'Houston',
                        capacity: 1200,
                        current_occupancy: 700,
                        resources: {
                            food: 45,
                            water: 25,
                            medical: 15
                        },
                        status: 'Active',
                        created_at: new Date(2025, 3, 18)
                    }
                ]);
            } else if (endpoint.startsWith('camps/') && method === 'GET') {
                const campId = parseInt(endpoint.split('/')[1]);
                resolve({
                    id: campId,
                    name: 'Camp Alpha',
                    location: 'New York',
                    capacity: 1000,
                    current_occupancy: 500,
                    contact_person: 'David Miller',
                    contact_number: '123-456-7890',
                    resources: {
                        food: 75,
                        water: 60,
                        medical: 35
                    },
                    status: 'Active',
                    created_at: new Date(2025, 3, 20)
                });
            } else if (endpoint === 'donors' && method === 'GET') {
                resolve([
                    {
                        id: 1,
                        name: 'Eve Miller',
                        email: 'eve.miller@example.com',
                        donation_type: 'Medical Supplies',
                        donation_date: new Date(2025, 3, 25),
                        status: 'Received',
                        created_at: new Date(2025, 3, 25)
                    },
                    {
                        id: 2,
                        name: 'Frank Johnson',
                        email: 'frank.j@example.com',
                        donation_type: 'Food',
                        donation_date: new Date(2025, 3, 26),
                        status: 'Received',
                        created_at: new Date(2025, 3, 26)
                    },
                    {
                        id: 3,
                        name: 'Grace Thompson',
                        email: 'grace.t@example.com',
                        donation_type: 'Clothing',
                        donation_date: new Date(2025, 3, 27),
                        status: 'In Transit',
                        created_at: new Date(2025, 3, 27)
                    }
                ]);
            } else if (endpoint === 'requests' && method === 'GET') {
                resolve([
                    {
                        id: 1,
                        camp_id: 1,
                        camp_name: 'Camp Alpha',
                        resource_id: 1,
                        resource_name: 'Bottled Water',
                        quantity: 100,
                        priority: 'High',
                        status: 'Fulfilled',
                        created_at: new Date(2025, 3, 24)
                    },
                    {
                        id: 2,
                        camp_id: 2,
                        camp_name: 'Camp Beta',
                        resource_id: 3,
                        resource_name: 'First Aid Kits',
                        quantity: 50,
                        priority: 'Medium',
                        status: 'Fulfilled',
                        created_at: new Date(2025, 3, 25)
                    },
                    {
                        id: 3,
                        camp_id: 3,
                        camp_name: 'Camp Gamma',
                        resource_id: 2,
                        resource_name: 'Blankets',
                        quantity: 75,
                        priority: 'Medium',
                        status: 'Pending',
                        created_at: new Date(2025, 3, 26)
                    },
                    {
                        id: 4,
                        camp_id: 3,
                        camp_name: 'Camp Gamma',
                        resource_id: 4,
                        resource_name: 'Medical Supplies',
                        quantity: 30,
                        priority: 'High',
                        status: 'Pending',
                        created_at: new Date(2025, 3, 27)
                    }
                ]);
            } else if (method === 'POST' || method === 'PUT') {
                // Return the submitted data with an ID for POST requests
                if (method === 'POST') {
                    resolve({
                        id: Math.floor(Math.random() * 1000) + 10,
                        ...data,
                        created_at: new Date().toISOString()
                    });
                } else {
                    resolve({
                        success: true,
                        ...data
                    });
                }
            }
        }, 500);
    });
}

/**
 * Display a toast notification
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {string} message - Notification message
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(type, message, duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
        default:
            icon = 'fa-info-circle';
            break;
    }
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    const timeoutId = setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
    
    // Remove on close button click
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
}

/**
 * Format a date into a readable string
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = false) {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    
    // Check if date is valid
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('en-US', options);
}

/**
 * Create a modal dynamically
 * @param {string} title - Modal title
 * @param {string} content - Modal content HTML
 * @returns {HTMLElement} The modal element
 */
export function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <span class="close">&times;</span>
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close button event
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
    
    // Click outside modal to close
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

/**
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Function to call when confirmed
 */
export function confirmDialog(message, onConfirm) {
    const content = `
        <div class="confirm-dialog">
            <p>${message}</p>
            <div class="form-actions">
                <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                <button type="button" class="btn-primary confirm-btn">Confirm</button>
            </div>
        </div>
    `;
    
    const modal = createModal('Confirmation', content);
    
    // Cancel button event
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Confirm button event
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
        modal.remove();
        if (onConfirm && typeof onConfirm === 'function') {
            onConfirm();
        }
    });
}

/**
 * Create table rows from data
 * @param {Array} items - Array of data items
 * @param {Array} columns - Column definitions with keys and formatters
 * @returns {DocumentFragment} Fragment containing the rows
 */
export function createTableRows(items, columns) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const row = document.createElement('tr');
        
        columns.forEach(column => {
            const cell = document.createElement('td');
            const value = item[column.key];
            
            // Use formatter if provided, otherwise use raw value
            if (column.formatter && typeof column.formatter === 'function') {
                cell.innerHTML = column.formatter(value, item);
            } else {
                cell.textContent = value || '';
            }
            
            row.appendChild(cell);
        });
        
        fragment.appendChild(row);
    });
    
    return fragment;
}

/**
 * Setup table search functionality
 * @param {HTMLInputElement} searchInput - Search input element
 * @param {HTMLTableElement} table - Table to search
 * @param {number[]} columns - Column indexes to search (optional)
 */
export function setupTableSearch(searchInput, table, columns = null) {
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            let text = '';
            
            // If columns specified, only search those columns
            if (columns && columns.length > 0) {
                columns.forEach(colIndex => {
                    const cell = row.cells[colIndex];
                    if (cell) {
                        text += cell.textContent.toLowerCase() + ' ';
                    }
                });
            } else {
                // Otherwise search all columns
                text = row.textContent.toLowerCase();
            }
            
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

/**
 * Setup sidebar toggle functionality
 */
export function setupSidebar() {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
    
    // Add toggle button to the page
    const header = document.querySelector('header');
    if (header) {
        header.insertBefore(toggleBtn, header.firstChild);
    }
    
    // Sidebar elements
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    // For mobile view
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    
    if (toggleBtn && sidebar && content) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    }
    
    // For mobile view
    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && 
                !hamburgerMenu.contains(event.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    // Close sidebar on mobile when a link is clicked
    const navLinks = sidebar.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
}