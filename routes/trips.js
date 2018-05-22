const express = require('express');
const router = express.Router();

const TripsController = require('../controllers/trips');
const checkAuth = require('../middleware/check-auth');

router.get('', checkAuth, TripsController.get_trips);

module.exports = router;