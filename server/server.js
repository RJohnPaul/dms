// Main server file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const dbConfig = require('./db.config');

const app = express();

// Use CORS middleware
app.use(cors({
    origin: '*'
}));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    waitForConnections: true,
    connectionLimit: dbConfig.pool.max,
    queueLimit: 0
});

// Simple route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Incident Management System API.' });
});

// API Endpoints

// Get all incidents
app.get('/api/incidents', (req, res) => {
    pool.query('SELECT * FROM incidents', (err, results) => {
        if (err) {
            console.error('Error fetching incidents: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get incidents by ID
app.get('/api/incidents/:id', (req, res) => {
    pool.query('SELECT * FROM incidents WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching incident: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Incident not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Create a new incident
app.post('/api/incidents', (req, res) => {
    const incident = req.body;
    pool.query('INSERT INTO incidents SET ?', incident, (err, result) => {
        if (err) {
            console.error('Error creating incident: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, ...incident });
    });
});

// Get all camps
app.get('/api/camps', (req, res) => {
    pool.query('SELECT * FROM camps', (err, results) => {
        if (err) {
            console.error('Error fetching camps: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get camp by ID
app.get('/api/camps/:id', (req, res) => {
    pool.query('SELECT * FROM camps WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching camp: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Camp not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Create a new camp
app.post('/api/camps', (req, res) => {
    const camp = req.body;
    pool.query('INSERT INTO camps SET ?', camp, (err, result) => {
        if (err) {
            console.error('Error creating camp: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, ...camp });
    });
});

// Get all donors
app.get('/api/donors', (req, res) => {
    pool.query('SELECT * FROM donors', (err, results) => {
        if (err) {
            console.error('Error fetching donors: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get donor by ID
app.get('/api/donors/:id', (req, res) => {
    pool.query('SELECT * FROM donors WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching donor: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Donor not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Create a new donor
app.post('/api/donors', (req, res) => {
    const donor = req.body;
    pool.query('INSERT INTO donors SET ?', donor, (err, result) => {
        if (err) {
            console.error('Error creating donor: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, ...donor });
    });
});

// Get all requests
app.get('/api/requests', (req, res) => {
    pool.query(`
        SELECT r.*, c.name as camp_name, rs.name as resource_name 
        FROM requests r
        JOIN camps c ON r.camp_id = c.id
        JOIN resources rs ON r.resource_id = rs.id
    `, (err, results) => {
        if (err) {
            console.error('Error fetching requests: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get request by ID
app.get('/api/requests/:id', (req, res) => {
    pool.query(`
        SELECT r.*, c.name as camp_name, rs.name as resource_name 
        FROM requests r
        JOIN camps c ON r.camp_id = c.id
        JOIN resources rs ON r.resource_id = rs.id
        WHERE r.id = ?
    `, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching request: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Create a new request
app.post('/api/requests', (req, res) => {
    const request = req.body;
    pool.query('INSERT INTO requests SET ?', request, (err, result) => {
        if (err) {
            console.error('Error creating request: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, ...request });
    });
});

// Update request status
app.put('/api/requests/:id/status', (req, res) => {
    const { status } = req.body;
    pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
        if (err) {
            console.error('Error updating request status: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        res.json({ id: parseInt(req.params.id), status });
    });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
    pool.query('SELECT * FROM vehicles', (err, results) => {
        if (err) {
            console.error('Error fetching vehicles: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get all resources
app.get('/api/resources', (req, res) => {
    pool.query('SELECT * FROM resources', (err, results) => {
        if (err) {
            console.error('Error fetching resources: ', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Get available resources (for charts)
app.get('/api/resources/available', (req, res) => {
    // This endpoint would typically query the actual resources table with available quantities
    // For demo purposes, we'll return mock data
    const mockData = [
        { type: 'Food', quantity: 250 },
        { type: 'Water', quantity: 500 },
        { type: 'Medical', quantity: 150 },
        { type: 'Shelter', quantity: 100 },
        { type: 'Clothing', quantity: 300 },
        { type: 'Other', quantity: 200 }
    ];
    res.json(mockData);
});

// Get requested resources (for charts)
app.get('/api/resources/requested', (req, res) => {
    // This endpoint would typically query the requests table and sum quantities by resource type
    // For demo purposes, we'll return mock data
    const mockData = [
        { type: 'Food', quantity: 180 },
        { type: 'Water', quantity: 350 },
        { type: 'Medical', quantity: 120 },
        { type: 'Shelter', quantity: 80 },
        { type: 'Clothing', quantity: 150 },
        { type: 'Other', quantity: 90 }
    ];
    res.json(mockData);
});

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
    // In a real application, these would be calculated from database queries
    // For demo purposes, we'll return mock data
    const mockStats = {
        totalIncidents: 12,
        activeIncidents: 5,
        resolvedIncidents: 7,
        totalCamps: 4,
        totalPeople: 1200,
        totalRequests: 15,
        pendingRequests: 8,
        fulfilledRequests: 7
    };
    res.json(mockStats);
});

// Set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});