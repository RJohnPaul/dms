/**
 * Utilities module for common functions used across the application
 */

// Toast notification system
let toastTimeout;

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast: 'success', 'error', 'warning', or 'info'
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Clear any existing toast
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

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
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${getToastIcon(type)}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Add event listener for close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    // Auto-remove after duration
    toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Get the Font Awesome icon class for toast types
 * @param {string} type - Type of toast
 * @returns {string} Icon class
 */
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

/**
 * Validate an input field
 * @param {string} value - Input value
 * @param {string} errorMessage - Error message if validation fails
 * @returns {boolean} True if valid, false if not
 */
export function validateInput(value, errorMessage = 'This field is required') {
    if (!value || value.trim() === '') {
        return false;
    }
    return true;
}

/**
 * Format a date in a user-friendly format
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date
 */
export function formatDate(date, includeTime = false) {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Invalid date';
    }
    
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
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add event listeners for filtering and sorting tables
 * @param {string} tableId - ID of the table element
 * @param {string} filterId - ID of the filter input element
 * @param {string} sortSelectId - ID of the sort select element
 */
export function setupTableFilters(tableId, filterId, sortSelectId) {
    const tableElement = document.getElementById(tableId);
    const filterElement = document.getElementById(filterId);
    const sortElement = document.getElementById(sortSelectId);
    
    if (!tableElement) return;
    
    if (filterElement) {
        filterElement.addEventListener('input', debounce(() => {
            filterTable(tableElement, filterElement.value.toLowerCase());
        }, 300));
    }
    
    if (sortElement) {
        sortElement.addEventListener('change', () => {
            const [column, direction] = sortElement.value.split('-');
            sortTable(tableElement, parseInt(column), direction === 'asc');
        });
    }
}

/**
 * Filter table rows based on input
 * @param {HTMLElement} table - Table element
 * @param {string} filterText - Text to filter by
 */
function filterTable(table, filterText) {
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filterText) ? '' : 'none';
    });
}

/**
 * Sort table based on column
 * @param {HTMLElement} table - Table element
 * @param {number} columnIndex - Index of column to sort by (0-based)
 * @param {boolean} ascending - Sort direction
 */
function sortTable(table, columnIndex, ascending) {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const tbody = table.querySelector('tbody');
    
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();
        
        if (!isNaN(parseFloat(cellA)) && !isNaN(parseFloat(cellB))) {
            return ascending ? 
                parseFloat(cellA) - parseFloat(cellB) : 
                parseFloat(cellB) - parseFloat(cellA);
        }
        
        return ascending ? 
            cellA.localeCompare(cellB) : 
            cellB.localeCompare(cellA);
    });
    
    // Re-append rows in new order
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * Initialize modals in the page
 */
export function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const closeButtons = document.querySelectorAll('.modal .close, .modal .cancel-btn');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

/**
 * Set up sidebar functionality
 */
export function initSidebar() {
    const toggleButton = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (toggleButton && sidebar && content) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    }
    
    // For mobile
    const mobileToggle = document.getElementById('mobile-toggle');
    
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                e.target !== mobileToggle) {
                sidebar.classList.remove('open');
            }
        });
    }
}

/**
 * Load content via AJAX
 * @param {string} url - URL to load
 * @param {HTMLElement} targetElement - Element to update with content
 * @param {Function} callback - Optional callback after content is loaded
 */
export function loadContent(url, targetElement, callback = null) {
    const xhr = new XMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                targetElement.innerHTML = xhr.responseText;
                if (callback) callback();
            } else {
                targetElement.innerHTML = '<div class="error-message">Error loading content</div>';
            }
        }
    };
    
    xhr.open('GET', url, true);
    xhr.send();
}

/**
 * Format a number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Create a confirmation dialog
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Function to call if confirmed
 * @param {Function} onCancel - Function to call if cancelled
 */
export function confirmAction(message, onConfirm, onCancel = null) {
    // Check if there's already a confirm dialog
    let modal = document.querySelector('.confirm-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal confirm-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirm Action</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body confirm-dialog">
                    <p>${message}</p>
                    <div class="form-actions">
                        <button class="btn-secondary cancel-btn">Cancel</button>
                        <button class="btn-primary confirm-btn">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    } else {
        modal.querySelector('p').textContent = message;
    }
    
    // Set up event listeners
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');
    
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });
    
    confirmBtn.addEventListener('click', () => {
        closeModal();
        onConfirm();
    });
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
            if (onCancel) onCancel();
        }
    });
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

/**
 * Get the distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function deg2rad(deg) {
    return deg * (Math.PI/180);
}