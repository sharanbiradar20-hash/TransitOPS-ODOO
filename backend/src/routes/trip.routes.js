const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validateTripCreation } = require('../validators/trip.validator');

// POST / -> create a new trip (DRIVER only)
router.post('/', authenticate, authorize(['DRIVER']), validateTripCreation, tripController.createTrip);

// PATCH /:id/dispatch -> Draft → Dispatched (FLEET_MANAGER or DRIVER)
router.patch('/:id/dispatch', authenticate, authorize(['FLEET_MANAGER', 'DRIVER']), tripController.dispatchTrip);

// PATCH /:id/complete -> Dispatched → Completed (FLEET_MANAGER or DRIVER)
router.patch('/:id/complete', authenticate, authorize(['FLEET_MANAGER', 'DRIVER']), tripController.completeTrip);

// PATCH /:id/cancel -> Dispatched → Cancelled (FLEET_MANAGER or DRIVER)
router.patch('/:id/cancel', authenticate, authorize(['FLEET_MANAGER', 'DRIVER']), tripController.cancelTrip);

module.exports = router;
