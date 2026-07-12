const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /kpis -> returns system-wide KPIs
router.get('/kpis', authenticate, dashboardController.getKpis);

module.exports = router;
