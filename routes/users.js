const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UserController = require('../controllers/user');
const passportFacebook = require('../controllers/auth-facebook');
const passportGoogle = require('../controllers/auth-google');

router.post('/login', UserController.user_login);
router.post('/login/facebook', passportFacebook.authenticate('facebook'));
router.get('/login/facebook/callback',
    passportFacebook.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        console.log('facebook success');
    });
router.post('/login/google', passportGoogle.authenticate('google'));
router.get('/login/google/callback',
    passportGoogle.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        console.log('google success');
    });
router.post('/registration', UserController.user_registration);
router.get('/activate-account/:activationHash', UserController.user_activation_account);
router.post('/forgot-password', UserController.user_forgot_password);
router.get('/:id', checkAuth, UserController.get_user_by_id);

module.exports = router;
