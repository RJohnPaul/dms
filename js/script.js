// Main JavaScript file for the Incident Management System
// Import utilities for API, UI, and data formatting
import { 
    apiRequest, 
    showToast, 
    formatDate, 
    createModal, 
    confirmDialog, 
    createTableRows,
    setupTableSearch,
    setupSidebar
} from './utilities.js';

// API base URL
const API_BASE_URL = 'api';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup sidebar toggle functionality
    setupSidebar();
    
    // Set current date in the header
    updateCurrentDate();
    
    // Determine current page and initialize accordingly
    initializeCurrentPage();
});

// Set current date in the header
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Initialize current page based on URL
function initializeCurrentPage() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();
    
    // Initialize page-specific functionality
    if (pageName === 'index.html' || pageName === '') {
        initializeDashboardPage();
    } else if (pageName === 'report-incident.html') {
        initializeIncidentPage();
    } else if (pageName === 'relief-camp.html') {
        initializeReliefCampPage();
    } else if (pageName === 'donors.html') {
        initializeDonorsPage();
    } else if (pageName === 'requests.html') {
        initializeRequestsPage();
    }
}

// Initialize dashboard page
async function initializeDashboardPage() {
    // Try to load dashboard statistics
    try {
        const stats = await apiRequest(`${API_BASE_URL}/dashboard/stats`);
        
        // Update statistics
        if (stats) {
            document.getElementById('incident-count').textContent = stats.activeIncidents || 0;
            document.getElementById('camp-count').textContent = stats.totalCamps || 0;
            document.getElementById('donor-count').textContent = stats.totalDonors || 0;
            document.getElementById('request-count').textContent = stats.pendingRequests || 0;
        }
        
        // Initialize charts after we have the data
        initializeDashboardCharts();
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('error', 'Failed to load dashboard statistics');
    }
    
    // Load recent incidents for the dashboard
    loadRecentIncidents();
}

// Load recent incidents for the dashboard
async function loadRecentIncidents() {
    try {
        const incidents = await apiRequest(`${API_BASE_URL}/incidents`);
        
        const recentIncidentsContainer = document.querySelector('.recent-incidents tbody');
        
        if (recentIncidentsContainer && incidents && incidents.length > 0) {
            // Get only the 5 most recent incidents
            const recentIncidents = incidents.slice(0, 5);
            
            const columns = [
                { key: 'id' },
                { key: 'description' },
                { key: 'camp_name' },
                { 
                    key: 'severity',
                    formatter: (severity) => {
                        const statusClass = 
                            severity === 'High' ? 'status-high' : 
                            severity === 'Medium' ? 'status-medium' : 'status-low';
                        return `<span class="${statusClass}">${severity}</span>`;
                    }
                },
                { key: 'reported_by' },
                { key: 'status' },
                { 
                    key: 'id',
                    formatter: (id) => `<button class="btn-view" data-id="${id}">View</button>`
                }
            ];
            
            const tableRows = createTableRows(recentIncidents, columns);
            recentIncidentsContainer.innerHTML = '';
            recentIncidentsContainer.appendChild(tableRows);
            
            // Add event listeners to the view buttons
            recentIncidentsContainer.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', () => {
                    const incidentId = button.getAttribute('data-id');
                    viewIncidentDetails(incidentId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading recent incidents:', error);
        showToast('error', 'Failed to load recent incidents');
    }
}

// Initialize dashboard charts
function initializeDashboardCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Charts will not be displayed.');
        return;
    }
    
    // Incident Type Distribution Chart
    const incidentTypeCtx = document.getElementById('incident-type-chart');
    if (incidentTypeCtx) {
        new Chart(incidentTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Flooding', 'Medical Emergency', 'Supply Shortage', 'Security Issue', 'Infrastructure'],
                datasets: [{
                    data: [30, 22, 18, 15, 15],
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            boxWidth: 12
                        }
                    },
                    title: {
                        display: true,
                        text: 'Incident Type Distribution',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // Camp Occupancy Chart
    const campOccupancyCtx = document.getElementById('camp-occupancy-chart');
    if (campOccupancyCtx) {
        new Chart(campOccupancyCtx, {
            type: 'bar',
            data: {
                labels: ['Camp Alpha', 'Camp Beta', 'Camp Gamma', 'Camp Delta', 'Camp Epsilon', 'Camp Zeta'],
                datasets: [{
                    label: 'Current Occupancy',
                    data: [500, 300, 700, 420, 550, 380],
                    backgroundColor: '#3b82f6',
                    barPercentage: 0.5,
                }, {
                    label: 'Capacity',
                    data: [1000, 800, 1200, 800, 1000, 600],
                    backgroundColor: '#d1d5db',
                    barPercentage: 0.5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: false,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: false,
                        grid: {
                            borderDash: [2, 2]
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Camp Occupancy vs. Capacity',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // Resource Distribution Chart
    const resourceDistCtx = document.getElementById('resource-dist-chart');
    if (resourceDistCtx) {
        new Chart(resourceDistCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Food',
                    data: [80, 70, 60, 75],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Water',
                    data: [85, 65, 40, 60],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Medical',
                    data: [70, 50, 30, 45],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            borderDash: [2, 2]
                        },
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Resource Level Trends',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
}

// Initialize incident page
function initializeIncidentPage() {
    // Load incidents data
    loadIncidents();
    
    // Setup incident form
    setupIncidentForm();
    
    // Setup search functionality
    const searchInput = document.querySelector('.search-bar input');
    const incidentsTable = document.querySelector('.incidents-table');
    
    if (searchInput && incidentsTable) {
        setupTableSearch(searchInput, incidentsTable);
    }
    
    // Setup add incident button
    const addIncidentBtn = document.getElementById('add-incident-btn');
    if (addIncidentBtn) {
        addIncidentBtn.addEventListener('click', () => {
            // Get the modal
            const modal = document.getElementById('incident-modal');
            
            // Reset form if needed
            const form = document.getElementById('incident-form');
            if (form) {
                form.reset();
            }
            
            // Show the modal
            if (modal) {
                modal.style.display = 'block';
                
                // Close when clicking on X
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Close when clicking outside the modal
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }
}

// Load incidents data
async function loadIncidents() {
    try {
        const incidents = await apiRequest(`${API_BASE_URL}/incidents`);
        
        const incidentsContainer = document.querySelector('.incidents-table tbody');
        
        if (incidentsContainer && incidents && incidents.length > 0) {
            const columns = [
                { key: 'id' },
                { key: 'description' },
                { key: 'camp_name' },
                { 
                    key: 'severity',
                    formatter: (severity) => {
                        const statusClass = 
                            severity === 'High' ? 'status-high' : 
                            severity === 'Medium' ? 'status-medium' : 'status-low';
                        return `<span class="${statusClass}">${severity}</span>`;
                    }
                },
                { key: 'reported_by' },
                { key: 'status' },
                { 
                    key: 'id',
                    formatter: (id) => `<button class="btn-view" data-id="${id}">View</button>`
                }
            ];
            
            const tableRows = createTableRows(incidents, columns);
            incidentsContainer.innerHTML = '';
            incidentsContainer.appendChild(tableRows);
            
            // Add event listeners to the view buttons
            incidentsContainer.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', () => {
                    const incidentId = button.getAttribute('data-id');
                    viewIncidentDetails(incidentId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading incidents:', error);
        showToast('error', 'Failed to load incidents');
    }
}

// Setup incident form submission
function setupIncidentForm() {
    const incidentForm = document.getElementById('incident-form');
    
    if (incidentForm) {
        incidentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Get form values
            const description = document.getElementById('incident-description').value;
            const campId = document.getElementById('incident-camp').value;
            const severity = document.getElementById('incident-severity').value;
            const reportedBy = document.getElementById('incident-reporter').value;
            const needsMedical = document.getElementById('needs-medical').checked;
            const needsEvacuation = document.getElementById('needs-evacuation').checked;
            
            try {
                const newIncident = {
                    description,
                    camp_id: campId,
                    severity,
                    reported_by: reportedBy,
                    needs_medical: needsMedical,
                    needs_evacuation: needsEvacuation,
                    status: 'Active'
                };
                
                // Make API request to create incident
                const result = await apiRequest(`${API_BASE_URL}/incidents`, 'POST', newIncident);
                
                // Hide the modal
                const modal = document.getElementById('incident-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Show success message
                showToast('success', 'Incident reported successfully');
                
                // Reload incidents after a brief delay
                setTimeout(() => {
                    loadIncidents();
                }, 500);
                
            } catch (error) {
                console.error('Error creating incident:', error);
                showToast('error', 'Failed to report incident');
            }
        });
    }
}

// View incident details
async function viewIncidentDetails(incidentId) {
    try {
        const incident = await apiRequest(`${API_BASE_URL}/incidents/${incidentId}`);
        
        // Create modal content
        const content = `
            <div class="incident-details">
                <div class="detail-row">
                    <div class="detail-label">Description:</div>
                    <div class="detail-value">${incident.description}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Location/Camp:</div>
                    <div class="detail-value">${incident.camp_name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Severity:</div>
                    <div class="detail-value">
                        <span class="status-${incident.severity.toLowerCase()}">${incident.severity}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Reported By:</div>
                    <div class="detail-value">${incident.reported_by}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">${incident.status}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Needs Medical:</div>
                    <div class="detail-value">${incident.needs_medical ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Needs Evacuation:</div>
                    <div class="detail-value">${incident.needs_evacuation ? 'Yes' : 'No'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Reported On:</div>
                    <div class="detail-value">${formatDate(incident.created_at, true)}</div>
                </div>
                
                <div class="form-actions">
                    ${incident.status !== 'Resolved' 
                        ? `<button type="button" class="btn-primary resolve-btn" data-id="${incident.id}">Mark as Resolved</button>`
                        : ''
                    }
                    <button type="button" class="btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modal = createModal(`Incident #${incident.id} Details`, content);
        
        // Add event listener to resolve button
        const resolveBtn = modal.querySelector('.resolve-btn');
        if (resolveBtn) {
            resolveBtn.addEventListener('click', async () => {
                await updateIncidentStatus(incident.id, 'Resolved');
                modal.remove();
                loadIncidents();
            });
        }
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
    } catch (error) {
        console.error('Error viewing incident details:', error);
        showToast('error', 'Failed to load incident details');
    }
}

// Update incident status
async function updateIncidentStatus(incidentId, status) {
    try {
        const response = await apiRequest(`${API_BASE_URL}/incidents/${incidentId}/status`, 'PUT', { status });
        showToast('success', `Incident ${status} successfully`);
        return response;
    } catch (error) {
        console.error('Error updating incident status:', error);
        showToast('error', 'Failed to update incident status');
        throw error;
    }
}

// Initialize the relief camp page
async function initializeReliefCampPage() {
    // Load camps data
    await loadCamps();
    
    // Load pending requests
    await loadPendingRequests();
    
    // Setup add camp button
    setupAddCampButton();
    
    // Setup search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const campCards = document.querySelectorAll('.camp-card');
            
            campCards.forEach(card => {
                const campName = card.querySelector('h3').textContent.toLowerCase();
                const campLocation = card.querySelector('.location').textContent.toLowerCase();
                
                if (campName.includes(searchTerm) || campLocation.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Load camps data
async function loadCamps() {
    try {
        const camps = await apiRequest(`${API_BASE_URL}/camps`);
        
        const campsGrid = document.querySelector('.camps-grid');
        
        if (campsGrid && camps && camps.length > 0) {
            // Clear existing content
            campsGrid.innerHTML = '';
            
            // Add each camp
            camps.forEach(camp => {
                // Calculate occupancy rate
                const occupancyRate = Math.round((camp.current_occupancy / camp.capacity) * 100);
                
                const campCard = document.createElement('div');
                campCard.className = 'camp-card';
                
                campCard.innerHTML = `
                    <div class="camp-header">
                        <h3>${camp.name}</h3>
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${camp.location}</span>
                    </div>
                    <div class="camp-stats">
                        <div class="stat">
                            <span class="label">Capacity</span>
                            <span class="value">${camp.capacity}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Occupied</span>
                            <span class="value">${camp.current_occupancy}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Occupancy</span>
                            <span class="value">${occupancyRate}%</span>
                        </div>
                    </div>
                    <div class="camp-resources">
                        <h4>Resources Status</h4>
                        <div class="resource-bars">
                            <div class="resource">
                                <span>Food</span>
                                <div class="progress-bar">
                                    <div class="progress ${camp.resources?.food < 40 ? 'warning' : ''}" style="width: ${camp.resources?.food || 50}%;"></div>
                                </div>
                            </div>
                            <div class="resource">
                                <span>Water</span>
                                <div class="progress-bar">
                                    <div class="progress ${camp.resources?.water < 40 ? 'warning' : ''}" style="width: ${camp.resources?.water || 50}%;"></div>
                                </div>
                            </div>
                            <div class="resource">
                                <span>Medical</span>
                                <div class="progress-bar">
                                    <div class="progress ${camp.resources?.medical < 40 ? 'warning' : ''}" style="width: ${camp.resources?.medical || 50}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="camp-actions">
                        <button class="btn-view" data-id="${camp.id}">View Details</button>
                        <button class="btn-request" data-id="${camp.id}">Make Request</button>
                    </div>
                `;
                
                // Add event listeners to buttons
                campCard.querySelector('.btn-view').addEventListener('click', () => {
                    viewCampDetails(camp.id);
                });
                
                campCard.querySelector('.btn-request').addEventListener('click', () => {
                    openRequestForm(camp.id);
                });
                
                campsGrid.appendChild(campCard);
            });
            
            // Update statistics cards
            updateCampStatistics(camps);
        }
    } catch (error) {
        console.error('Error loading camps:', error);
        showToast('error', 'Failed to load relief camps');
    }
}

// Update camp statistics in the dashboard cards
function updateCampStatistics(camps) {
    if (!camps || !camps.length) return;
    
    // Calculate totals
    const totalCamps = camps.length;
    let totalCapacity = 0;
    let totalOccupied = 0;
    
    camps.forEach(camp => {
        totalCapacity += camp.capacity;
        totalOccupied += camp.current_occupancy;
    });
    
    const occupancyRate = Math.round((totalOccupied / totalCapacity) * 100);
    
    // Update the cards
    const campCountElement = document.querySelector('.card-info h2:nth-of-type(1)');
    const capacityElement = document.querySelector('.card-info h2:nth-of-type(2)');
    const occupiedElement = document.querySelector('.card-info h2:nth-of-type(3)');
    const occupancyElement = document.querySelector('.card-info h2:nth-of-type(4)');
    
    if (campCountElement) campCountElement.textContent = totalCamps;
    if (capacityElement) capacityElement.textContent = totalCapacity;
    if (occupiedElement) occupiedElement.textContent = totalOccupied;
    if (occupancyElement) occupancyElement.textContent = `${occupancyRate}%`;
}

// View camp details
async function viewCampDetails(campId) {
    try {
        const camp = await apiRequest(`${API_BASE_URL}/camps/${campId}`);
        
        // Calculate occupancy rate
        const occupancyRate = Math.round((camp.current_occupancy / camp.capacity) * 100);
        
        // Create modal content
        const content = `
            <div class="camp-details">
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${camp.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Location:</div>
                    <div class="detail-value">${camp.location}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Capacity:</div>
                    <div class="detail-value">${camp.capacity}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Occupied:</div>
                    <div class="detail-value">${camp.current_occupancy}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Occupancy Rate:</div>
                    <div class="detail-value">${occupancyRate}%</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Contact Person:</div>
                    <div class="detail-value">${camp.contact_person || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Contact Number:</div>
                    <div class="detail-value">${camp.contact_number || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">${camp.status || 'Active'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Established:</div>
                    <div class="detail-value">${formatDate(camp.created_at)}</div>
                </div>
                
                <h4 class="detail-section-title">Resource Status</h4>
                <div class="resource-bars">
                    <div class="resource">
                        <span>Food</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${camp.resources?.food || 70}%;"></div>
                        </div>
                    </div>
                    <div class="resource">
                        <span>Water</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${camp.resources?.water || 60}%;"></div>
                        </div>
                    </div>
                    <div class="resource">
                        <span>Medical</span>
                        <div class="progress-bar">
                            <div class="progress ${camp.resources?.medical < 40 ? 'warning' : ''}" style="width: ${camp.resources?.medical || 50}%;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-primary request-btn" data-id="${camp.id}">Request Resources</button>
                    <button type="button" class="btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modal = createModal(`${camp.name} Details`, content);
        
        // Add event listener to request button
        modal.querySelector('.request-btn').addEventListener('click', () => {
            modal.remove();
            openRequestForm(camp.id);
        });
        
        // Add event listener to close button
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
        
    } catch (error) {
        console.error('Error viewing camp details:', error);
        showToast('error', 'Failed to load camp details');
    }
}

// Open request form
function openRequestForm(campId) {
    // Create modal content
    const content = `
        <form id="request-form">
            <input type="hidden" id="request-camp-id" value="${campId}">
            <div class="form-row">
                <div class="form-group">
                    <label for="request-resource">Resource</label>
                    <select id="request-resource" name="request-resource" required>
                        <option value="">Select resource</option>
                        <option value="1">Bottled Water</option>
                        <option value="2">Blankets</option>
                        <option value="3">First Aid Kits</option>
                        <option value="4">Medical Supplies</option>
                        <option value="5">Canned Food</option>
                        <option value="6">Tents</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="request-quantity">Quantity Needed</label>
                    <input type="number" id="request-quantity" name="request-quantity" min="1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="request-priority">Priority</label>
                    <select id="request-priority" name="request-priority" required>
                        <option value="">Select priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="request-notes">Additional Notes</label>
                    <textarea id="request-notes" name="request-notes" rows="3"></textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                <button type="submit" class="btn-primary">Submit Request</button>
            </div>
        </form>
    `;
    
    // Create and show modal
    const modal = createModal(`Request Resources`, content);
    
    // Handle form submission
    const form = modal.querySelector('#request-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form values
        const campId = document.getElementById('request-camp-id').value;
        const resourceId = document.getElementById('request-resource').value;
        const quantity = document.getElementById('request-quantity').value;
        const priority = document.getElementById('request-priority').value;
        const notes = document.getElementById('request-notes').value;
        
        try {
            // Get resource name for display
            const resourceElement = document.getElementById('request-resource');
            const resourceName = resourceElement.options[resourceElement.selectedIndex].text;
            
            const newRequest = {
                camp_id: campId,
                resource_id: resourceId,
                resource_name: resourceName,
                quantity: parseInt(quantity),
                priority,
                notes,
                status: 'Pending'
            };
            
            // Make API request
            await apiRequest(`${API_BASE_URL}/requests`, 'POST', newRequest);
            
            // Close modal
            modal.remove();
            
            // Show success message
            showToast('success', 'Resource request submitted successfully');
            
            // Reload pending requests
            setTimeout(() => {
                loadPendingRequests();
            }, 500);
            
        } catch (error) {
            console.error('Error creating request:', error);
            showToast('error', 'Failed to submit resource request');
        }
    });
    
    // Cancel button event
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
}

// Setup add camp button
function setupAddCampButton() {
    const addCampBtn = document.getElementById('add-camp-btn');
    if (addCampBtn) {
        addCampBtn.addEventListener('click', () => {
            // Get the modal
            const modal = document.getElementById('camp-modal');
            
            // Reset form if needed
            const form = document.getElementById('camp-form');
            if (form) {
                form.reset();
            }
            
            // Show the modal
            if (modal) {
                modal.style.display = 'block';
                
                // Close when clicking on X or cancel button
                const closeBtn = modal.querySelector('.close');
                const cancelBtn = document.getElementById('cancel-camp');
                
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Close when clicking outside the modal
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Handle form submission
                if (form) {
                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        
                        // Get form values
                        const name = document.getElementById('camp-name').value;
                        const location = document.getElementById('camp-location').value;
                        const capacity = document.getElementById('camp-capacity').value;
                        const occupied = document.getElementById('camp-occupied').value;
                        
                        try {
                            const newCamp = {
                                name,
                                location,
                                capacity: parseInt(capacity),
                                current_occupancy: parseInt(occupied),
                                status: 'Active',
                                resources: {
                                    food: 100,
                                    water: 100,
                                    medical: 100
                                }
                            };
                            
                            // Make API request
                            await apiRequest(`${API_BASE_URL}/camps`, 'POST', newCamp);
                            
                            // Close modal
                            modal.style.display = 'none';
                            
                            // Show success message
                            showToast('success', 'Relief camp added successfully');
                            
                            // Reload camps
                            setTimeout(() => {
                                loadCamps();
                            }, 500);
                            
                        } catch (error) {
                            console.error('Error creating camp:', error);
                            showToast('error', 'Failed to add relief camp');
                        }
                    });
                }
            }
        });
    }
}

// Load pending resource requests
async function loadPendingRequests() {
    try {
        const requests = await apiRequest(`${API_BASE_URL}/requests`);
        
        const requestsContainer = document.querySelector('.pending-requests tbody');
        
        if (requestsContainer && requests && requests.length > 0) {
            // Clear existing content
            requestsContainer.innerHTML = '';
            
            // Add each request
            requests.forEach(request => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${request.id}</td>
                    <td>${request.camp_name}</td>
                    <td>${request.resource_name}</td>
                    <td>${request.quantity}</td>
                    <td><span class="status-${request.status.toLowerCase()}">${request.status}</span></td>
                    <td>
                        <button class="btn-view sm" data-id="${request.id}">View</button>
                        ${request.status === 'Pending' ? `<button class="btn-approve sm" data-id="${request.id}">Approve</button>` : ''}
                    </td>
                `;
                
                requestsContainer.appendChild(row);
            });
            
            // Add event listeners to buttons
            requestsContainer.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', () => {
                    const requestId = button.getAttribute('data-id');
                    viewRequestDetails(requestId);
                });
            });
            
            requestsContainer.querySelectorAll('.btn-approve').forEach(button => {
                button.addEventListener('click', () => {
                    const requestId = button.getAttribute('data-id');
                    approveRequest(requestId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        showToast('error', 'Failed to load pending requests');
    }
}

// View request details
async function viewRequestDetails(requestId) {
    try {
        const requests = await apiRequest(`${API_BASE_URL}/requests`);
        const request = requests.find(r => r.id.toString() === requestId.toString());
        
        if (!request) {
            showToast('error', 'Request not found');
            return;
        }
        
        // Create modal content
        const content = `
            <div class="request-details">
                <div class="detail-row">
                    <div class="detail-label">Camp:</div>
                    <div class="detail-value">${request.camp_name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Resource:</div>
                    <div class="detail-value">${request.resource_name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Quantity:</div>
                    <div class="detail-value">${request.quantity}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Priority:</div>
                    <div class="detail-value">
                        <span class="status-${request.priority.toLowerCase()}">${request.priority}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-${request.status.toLowerCase()}">${request.status}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Requested On:</div>
                    <div class="detail-value">${formatDate(request.created_at)}</div>
                </div>
                
                <div class="form-actions">
                    ${request.status === 'Pending' 
                        ? `<button type="button" class="btn-primary approve-btn" data-id="${request.id}">Approve Request</button>`
                        : ''
                    }
                    <button type="button" class="btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modal = createModal(`Request #${request.id} Details`, content);
        
        // Add event listener to approve button
        const approveBtn = modal.querySelector('.approve-btn');
        if (approveBtn) {
            approveBtn.addEventListener('click', async () => {
                await approveRequest(request.id);
                modal.remove();
                loadPendingRequests();
            });
        }
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
    } catch (error) {
        console.error('Error viewing request details:', error);
        showToast('error', 'Failed to load request details');
    }
}

// Approve request
async function approveRequest(requestId) {
    try {
        // Confirm before approving
        confirmDialog('Are you sure you want to approve this request?', async () => {
            await apiRequest(`${API_BASE_URL}/requests/${requestId}/status`, 'PUT', { status: 'Fulfilled' });
            showToast('success', 'Request approved successfully');
            loadPendingRequests();
        });
    } catch (error) {
        console.error('Error approving request:', error);
        showToast('error', 'Failed to approve request');
    }
}

// Initialize the donors page
async function initializeDonorsPage() {
    // Load donors data
    await loadDonors();
    
    // Setup add donor button
    setupAddDonorButton();
    
    // Setup search functionality
    const searchInput = document.querySelector('.search-bar input');
    const donorsTable = document.querySelector('.donors-table');
    
    if (searchInput && donorsTable) {
        setupTableSearch(searchInput, donorsTable);
    }
}

// Load donors data
async function loadDonors() {
    try {
        const donors = await apiRequest(`${API_BASE_URL}/donors`);
        
        const donorsContainer = document.querySelector('.donors-table tbody');
        
        if (donorsContainer && donors && donors.length > 0) {
            const columns = [
                { key: 'id' },
                { key: 'name' },
                { key: 'email' },
                { key: 'donation_type' },
                { 
                    key: 'donation_date',
                    formatter: (date) => formatDate(date)
                },
                { 
                    key: 'status',
                    formatter: (status) => {
                        const statusClass = 
                            status === 'Received' ? 'status-fulfilled' : 
                            status === 'In Transit' ? 'status-transit' : 'status-pending';
                        return `<span class="${statusClass}">${status}</span>`;
                    }
                },
                { 
                    key: 'id',
                    formatter: (id) => `<button class="btn-view" data-id="${id}">View</button>`
                }
            ];
            
            const tableRows = createTableRows(donors, columns);
            donorsContainer.innerHTML = '';
            donorsContainer.appendChild(tableRows);
            
            // Add event listeners to the view buttons
            donorsContainer.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', () => {
                    const donorId = button.getAttribute('data-id');
                    viewDonorDetails(donorId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading donors:', error);
        showToast('error', 'Failed to load donors');
    }
}

// Setup add donor button
function setupAddDonorButton() {
    const addDonorBtn = document.getElementById('add-donor-btn');
    if (addDonorBtn) {
        addDonorBtn.addEventListener('click', () => {
            // Get the modal
            const modal = document.getElementById('donor-modal');
            
            // Reset form if needed
            const form = document.getElementById('donor-form');
            if (form) {
                form.reset();
            }
            
            // Show the modal
            if (modal) {
                modal.style.display = 'block';
                
                // Close when clicking on X
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Close when clicking outside the modal
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Handle form submission
                if (form) {
                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        
                        // Get form values
                        const name = document.getElementById('donor-name').value;
                        const email = document.getElementById('donor-email').value;
                        const phone = document.getElementById('donor-phone').value;
                        const donationType = document.getElementById('donation-type').value;
                        const status = document.getElementById('donation-status').value;
                        
                        try {
                            const newDonor = {
                                name,
                                email,
                                phone,
                                donation_type: donationType,
                                donation_date: new Date().toISOString(),
                                status
                            };
                            
                            // Make API request
                            await apiRequest(`${API_BASE_URL}/donors`, 'POST', newDonor);
                            
                            // Close modal
                            modal.style.display = 'none';
                            
                            // Show success message
                            showToast('success', 'Donor added successfully');
                            
                            // Reload donors
                            setTimeout(() => {
                                loadDonors();
                            }, 500);
                            
                        } catch (error) {
                            console.error('Error creating donor:', error);
                            showToast('error', 'Failed to add donor');
                        }
                    });
                }
            }
        });
    }
}

// View donor details
async function viewDonorDetails(donorId) {
    try {
        const donors = await apiRequest(`${API_BASE_URL}/donors`);
        const donor = donors.find(d => d.id.toString() === donorId.toString());
        
        if (!donor) {
            showToast('error', 'Donor not found');
            return;
        }
        
        // Create modal content
        const content = `
            <div class="donor-details">
                <div class="detail-row">
                    <div class="detail-label">Name:</div>
                    <div class="detail-value">${donor.name}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">${donor.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value">${donor.phone || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Donation Type:</div>
                    <div class="detail-value">${donor.donation_type}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Donation Date:</div>
                    <div class="detail-value">${formatDate(donor.donation_date)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Status:</div>
                    <div class="detail-value">
                        <span class="status-${donor.status.toLowerCase().replace(' ', '-')}">${donor.status}</span>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Create and show modal
        const modal = createModal(`Donor Details`, content);
        
        // Add event listener to close button
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
    } catch (error) {
        console.error('Error viewing donor details:', error);
        showToast('error', 'Failed to load donor details');
    }
}

// Initialize the requests page
async function initializeRequestsPage() {
    // Load requests data
    await loadRequests();
    
    // Setup add request button
    setupAddRequestButton();
    
    // Setup search functionality
    const searchInput = document.querySelector('.search-bar input');
    const requestsTable = document.querySelector('.requests-table');
    
    if (searchInput && requestsTable) {
        setupTableSearch(searchInput, requestsTable);
    }
}

// Load all requests data
async function loadRequests() {
    try {
        const requests = await apiRequest(`${API_BASE_URL}/requests`);
        
        const requestsContainer = document.querySelector('.requests-table tbody');
        
        if (requestsContainer && requests && requests.length > 0) {
            const columns = [
                { key: 'id' },
                { key: 'camp_name' },
                { key: 'resource_name' },
                { key: 'quantity' },
                { 
                    key: 'priority',
                    formatter: (priority) => {
                        const priorityClass = 
                            priority === 'High' ? 'status-high' : 
                            priority === 'Medium' ? 'status-medium' : 'status-low';
                        return `<span class="${priorityClass}">${priority}</span>`;
                    }
                },
                { 
                    key: 'status',
                    formatter: (status) => {
                        const statusClass = 
                            status === 'Fulfilled' ? 'status-fulfilled' : 
                            status === 'Pending' ? 'status-pending' : '';
                        return `<span class="${statusClass}">${status}</span>`;
                    }
                },
                { 
                    key: 'id',
                    formatter: (id, request) => `
                        <button class="btn-view sm" data-id="${id}">View</button>
                        ${request.status === 'Pending' ? `<button class="btn-approve sm" data-id="${id}">Approve</button>` : ''}
                    `
                }
            ];
            
            const tableRows = createTableRows(requests, columns);
            requestsContainer.innerHTML = '';
            requestsContainer.appendChild(tableRows);
            
            // Add event listeners to the buttons
            requestsContainer.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', () => {
                    const requestId = button.getAttribute('data-id');
                    viewRequestDetails(requestId);
                });
            });
            
            requestsContainer.querySelectorAll('.btn-approve').forEach(button => {
                button.addEventListener('click', () => {
                    const requestId = button.getAttribute('data-id');
                    approveRequest(requestId);
                });
            });
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        showToast('error', 'Failed to load requests');
    }
}

// Setup add request button
function setupAddRequestButton() {
    const addRequestBtn = document.getElementById('add-request-btn');
    if (addRequestBtn) {
        addRequestBtn.addEventListener('click', () => {
            // Get the modal
            const modal = document.getElementById('request-modal');
            
            // Reset form if needed
            const form = document.getElementById('request-form');
            if (form) {
                form.reset();
            }
            
            // Show the modal
            if (modal) {
                modal.style.display = 'block';
                
                // Close when clicking on X
                const closeBtn = modal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
                
                // Close when clicking outside the modal
                window.addEventListener('click', (event) => {
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                });
                
                // Handle form submission
                if (form) {
                    form.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        
                        // Get form values
                        const campId = document.getElementById('request-camp').value;
                        const resourceId = document.getElementById('request-resource').value;
                        const quantity = document.getElementById('request-quantity').value;
                        const priority = document.getElementById('request-priority').value;
                        const notes = document.getElementById('request-notes').value;
                        
                        try {
                            // Get camp and resource names for display
                            const campElement = document.getElementById('request-camp');
                            const campName = campElement.options[campElement.selectedIndex].text;
                            
                            const resourceElement = document.getElementById('request-resource');
                            const resourceName = resourceElement.options[resourceElement.selectedIndex].text;
                            
                            const newRequest = {
                                camp_id: campId,
                                camp_name: campName,
                                resource_id: resourceId,
                                resource_name: resourceName,
                                quantity: parseInt(quantity),
                                priority,
                                notes,
                                status: 'Pending'
                            };
                            
                            // Make API request
                            await apiRequest(`${API_BASE_URL}/requests`, 'POST', newRequest);
                            
                            // Close modal
                            modal.style.display = 'none';
                            
                            // Show success message
                            showToast('success', 'Request submitted successfully');
                            
                            // Reload requests
                            setTimeout(() => {
                                loadRequests();
                            }, 500);
                            
                        } catch (error) {
                            console.error('Error creating request:', error);
                            showToast('error', 'Failed to submit request');
                        }
                    });
                }
            }
        });
    }
}