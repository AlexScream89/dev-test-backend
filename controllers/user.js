const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generatePassword = require('password-generator');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const HelpersController = require('./helpers');

exports.user_login = async (req, res, next) => {
    try {
        //Search user by email
        const user = await User.findOne({email: req.body.email}).exec();

        if (user.length < 1) {
            return HelpersController.authErrorResponse(res, 'Auth failed');
        }

        if (!user.active) {
            return HelpersController.authErrorResponse(res, 'Your account not activate');
        }

        //Comparing passwords
        const comparePasswords = await bcrypt.compare(req.body.password, user.password);

        if (!comparePasswords) {
            return HelpersController.authErrorResponse(res, 'Auth failed');
        }

        //Create token
        const token = jwt.sign(
            {
                email: user.email,
                userId: user._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: '4h'
            }
        );

        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        return res.status(200).json({
            data: userData,
            message: 'Auth success',
            token: token
        });
    } catch (err) {
        return HelpersController.authErrorResponse(res, 'Auth failed');
    }
};

exports.user_login_facebook = (req, res, next) => {
    res.status(200).json({
        message: 'Login with facebook works!'
    });
};

exports.user_login_google = (req, res, next) => {
    res.status(200).json({
        message: 'Login with google works!'
    });
};

exports.user_registration = async (req, res, next) => {
    try {
        //Search user by email
        const user = await User.find({email: req.body.email}).exec();
        if (user.length >= 1) {
            return res.status(409).json({
                data: null,
                message: 'Email exists'
            });
        }
        //Match passwords
        const matchPSW = HelpersController.matchPasswords(res, req.body.password, req.body.repeatPassword);
        if (!matchPSW) {
            return;
        }

        //Bcrypt password
        const hash = await bcrypt.hash(req.body.password, 10);

        //Generate activation hash
        const activationHash = generatePassword(30, false);

        //Preparing user data for DB
        const userModel = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            activationHash: activationHash
        });

        //Save user to DB
        const userCreated = await userModel.save();

        res.status(200).json({
            message: 'Please check your email for account activation'
        });

        //Create activation link for email
        const host = req.headers.host;
        const activationLink = `${host}/users/activate-account/${activationHash}`;

        //Send activation email
        const crateTestAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport(HelpersController.mailConfig);
        const mailOptions = {
            from: '"Dev Test" <dev-test@admin.com>',
            to: req.body.email,
            subject: 'Account activation',
            html: `For account activation you need click this link - <a href='${activationLink}'>${activationLink}</a>`
        };
        const sendMail = await transporter.sendMail(mailOptions);
    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};

exports.user_forgot_password = async (req, res, next) => {
    try {
        //Search user by email
        const user = await User.find({email: req.body.email}).exec();
        if (user.length < 1) {
            return res.status(500).json({
                data: null,
                error: 'Email not found'
            });
        }

        //Generate new password
        const newPassword = generatePassword(10, false);

        //Send email
        const createTestAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport(HelpersController.mailConfig);

        const mailOptions = {
            from: '"Dev Test" <dev-test@admin.com>',
            to: req.body.email,
            subject: 'Reset password',
            text: `Your new password is ${newPassword}`
        };

        const sendMail = await transporter.sendMail(mailOptions);

        //Bcrypt new password
        const hash = await bcrypt.hash(newPassword, 10);

        //Save new password to DB
        const updatedUser = await User.update({email: req.body.email}, {$set: {password: hash}}).exec();
        res.status(200).json({
            data: null,
            message: 'Please check you email'
        });

    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};

exports.user_activation_account = async (req, res, next) => {
    const activationHash = req.params.activationHash;

    try {
        //Search user by email
        const user = await User.findOne({activationHash: activationHash}).exec();

        const updateObj = {
            active: 1,
            activationHash: null
        };

        //Activation user account
        const updatedUser = await User.update({_id: user._id}, {$set: updateObj}).exec();
        res.render('layout', { body: 'Your account activation' });
    } catch (err) {
        res.render('error', { message: 'Invalid activation link' });
    }
};

exports.get_user_by_id = async (req, res, next) => {
    try {
        //Search user by id
        const user = await User.findOne({_id: req.params.id}).select('_id email firstName lastName').exec();
        res.status(200).json({
            data: user
        });
    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};

exports.update_user = async (req, res, next) => {
    try {
        //Update user by id function
        const updateUser = async (userData) => {
            const updatedUser = await User.update({_id: req.params.id}, {$set: userData}).select('email firstName lastName').exec();
            res.status(200).json({
                data: null,
                message: 'User updated'
            });
        };

        //Search user by id
        const user = await User.findOne({_id: req.params.id}).exec();
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        };

        //Match passwords
        const matchPSW = HelpersController.matchPasswords(res, userData.password, req.body.repeatPassword);
        if (!matchPSW) {
            return;
        }

        if (userData.password.trim().length === 0) {
            delete userData.password;
            updateUser(userData);
        } else {
            //Bcrypt new password
            const hash = await bcrypt.hash(userData.password, 10);
            userData.password = hash;
            updateUser(userData);
        }
    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};
