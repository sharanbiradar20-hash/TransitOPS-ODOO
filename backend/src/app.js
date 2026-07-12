const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const fuelExpenseRoutes = require('./routes/fuelExpense.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// Mount application API routers
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel-logs', fuelExpenseRoutes);
app.use('/api/reports', reportRoutes);

// Catch-all route for non-existent endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

module.exports = app;
