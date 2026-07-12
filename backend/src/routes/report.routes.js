const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

// GET /fuel-efficiency -> FLEET_MANAGER, SAFETY_OFFICER, or FINANCIAL_ANALYST
router.get('/fuel-efficiency', authenticate, authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']), reportController.getFuelEfficiencyReport);

// GET /operational-cost -> FLEET_MANAGER or FINANCIAL_ANALYST
router.get('/operational-cost', authenticate, authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), reportController.getOperationalCostReport);

// GET /fleet-utilization -> FLEET_MANAGER or SAFETY_OFFICER
router.get('/fleet-utilization', authenticate, authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), reportController.getFleetUtilizationReport);

// GET /vehicle-roi -> FLEET_MANAGER or FINANCIAL_ANALYST
router.get('/vehicle-roi', authenticate, authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), reportController.getVehicleRoiReport);

module.exports = router;
