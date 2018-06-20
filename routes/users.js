const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UserController = require('../controllers/user');
const AuthController = require('../controllers/auth');
const passportFacebook = require('../controllers/auth-facebook');
const passportGoogle = require('../controllers/auth-google');

router.post('/login', AuthController.user_login);
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
router.post('/registration', AuthController.user_registration);
router.get('/activate-account/:activationHash', AuthController.user_activation_account);
router.post('/forgot-password', AuthController.user_forgot_password);
router.get('/:id', checkAuth, UserController.get_user_by_id);
router.patch('/:id', checkAuth, UserController.update_user);

module.exports = router;
