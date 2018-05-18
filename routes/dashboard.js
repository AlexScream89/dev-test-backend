const express = require('express');
const router = express.Router();

const DashboardController = require('../controllers/dashboard');
const checkAuth = require('../middleware/check-auth');

router.get('', checkAuth, DashboardController.get_dashboard);

module.exports = router;