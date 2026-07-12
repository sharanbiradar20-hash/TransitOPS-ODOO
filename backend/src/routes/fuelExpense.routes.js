const express = require('express');
const router = express.Router();
const fuelExpenseController = require('../controllers/fuelExpense.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET / -> any authenticated user can view fuel logs
router.get('/', authenticate, fuelExpenseController.getFuelLogs);

// POST / -> create a fuel log (FLEET_MANAGER or DRIVER)
router.post('/', authenticate, authorize(['FLEET_MANAGER', 'DRIVER']), fuelExpenseController.createFuelLog);

// POST /expenses -> create an expense record (FLEET_MANAGER or FINANCIAL_ANALYST)
router.post('/expenses', authenticate, authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), fuelExpenseController.createExpense);

module.exports = router;
