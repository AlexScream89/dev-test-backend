const express = require('express');
const router = express.Router();

const SettingsController = require('../controllers/settings');
const checkAuth = require('../middleware/check-auth');

router.get('', checkAuth, SettingsController.get_settings);

module.exports = router;