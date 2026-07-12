const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

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

// Catch-all route for non-existent endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

module.exports = app;
