const express = require('express');
const router = express.Router();

const TripsController = require('../controllers/trips');
const checkAuth = require('../middleware/check-auth');

router.get('', checkAuth, TripsController.get_trips);
router.post('', checkAuth, TripsController.trips_create);

module.exports = router;