// Database configuration for Incident Management System
module.exports = {
    HOST: "localhost",
    USER: "root", // Change this to your MySQL username
    PASSWORD: "", // Change this to your MySQL password
    DB: "incident_management", // Change this if you use a different database name
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};