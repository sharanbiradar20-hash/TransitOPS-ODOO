const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validateTripCreation } = require('../validators/trip.validator');

// GET / -> any authenticated user can view trips
router.get('/', authenticate, tripController.getTrips);

// POST / -> create a new trip (FLEET_MANAGER only)
router.post('/', authenticate, authorize(['FLEET_MANAGER']), validateTripCreation, tripController.createTrip);

// PATCH /:id/dispatch -> Draft → Dispatched (FLEET_MANAGER only)
router.patch('/:id/dispatch', authenticate, authorize(['FLEET_MANAGER']), tripController.dispatchTrip);

// PATCH /:id/complete -> Dispatched → Completed (DRIVER only)
router.patch('/:id/complete', authenticate, authorize(['DRIVER']), tripController.completeTrip);

// PATCH /:id/cancel -> Dispatched → Cancelled (FLEET_MANAGER only)
router.patch('/:id/cancel', authenticate, authorize(['FLEET_MANAGER']), tripController.cancelTrip);

module.exports = router;
