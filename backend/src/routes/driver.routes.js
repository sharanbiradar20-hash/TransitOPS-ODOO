const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET / -> any authenticated user can view
router.get('/', authenticate, driverController.getDrivers);

// POST, PUT -> allowed for FLEET_MANAGER and SAFETY_OFFICER
router.post('/', authenticate, authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), driverController.createDriver);
router.put('/:id', authenticate, authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), driverController.updateDriver);

// DELETE -> restricted to FLEET_MANAGER only
router.delete('/:id', authenticate, authorize(['FLEET_MANAGER']), driverController.deleteDriver);

module.exports = router;
