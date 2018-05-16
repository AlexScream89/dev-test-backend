const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user');

/* GET users listing. */
router.post('/login', UserController.user_login);
router.post('/registration', UserController.user_registration);

module.exports = router;
