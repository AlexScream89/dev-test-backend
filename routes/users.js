const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user');

router.post('/login', UserController.user_login);
router.post('/login/facebook', UserController.user_login_facebook);
router.post('/login/google', UserController.user_login_google);
router.post('/registration', UserController.user_registration);

module.exports = router;
