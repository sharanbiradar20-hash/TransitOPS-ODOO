const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET / -> any authenticated user can view
router.get('/', authenticate, vehicleController.getVehicles);

// POST, PUT, DELETE -> restricted to FLEET_MANAGER role only
router.post('/', authenticate, authorize(['FLEET_MANAGER']), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize(['FLEET_MANAGER']), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize(['FLEET_MANAGER']), vehicleController.deleteVehicle);

module.exports = router;
