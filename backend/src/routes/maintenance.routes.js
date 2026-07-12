const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET / -> any authenticated user can view maintenance records
router.get('/', authenticate, maintenanceController.getMaintenanceRecords);

// POST / -> create a maintenance record (FLEET_MANAGER only)
router.post('/', authenticate, authorize(['FLEET_MANAGER']), maintenanceController.createMaintenanceRecord);

// PATCH /:id/close -> close a maintenance record (FLEET_MANAGER only)
router.patch('/:id/close', authenticate, authorize(['FLEET_MANAGER']), maintenanceController.closeMaintenanceRecord);

module.exports = router;
