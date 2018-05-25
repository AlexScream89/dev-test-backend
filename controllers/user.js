const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generatePassword = require('password-generator');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const HelpersController = require('./helpers');

exports.user_login = (req, res, next) => {
    //Search user by email
    User.findOne({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return HelpersController.authErrorResponse(res, 'Auth failed');
            }

            //Comparing passwords
            bcrypt.compare(req.body.password, user.password, (err, data) =>  {
                if (err) {
                    return HelpersController.authErrorResponse(res, 'Auth failed');
                }

                if (!user.active) {
                    return HelpersController.authErrorResponse(res, 'Your account not activate');
                }

                if (data) {
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
                    })
                }
                return HelpersController.authErrorResponse(res, 'Auth failed');
            });
        })
        .catch(err => HelpersController.errorResponse(res, err));
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

exports.user_registration = (req, res, next) => {
    //Search user by email
    User.find({email: req.body.email})
        .exec()
        .then(data => {
            if (data.length >= 1) {
                res.status(409).json({
                    data: null,
                    message: 'Email exists'
                });
            } else {
                //Match passwords
                const matchPSW = HelpersController.matchPasswords(res, req.body.password, req.body.repeatPassword);
                if (!matchPSW) {
                    return;
                }

                //Bcrypt password
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        //Generate activation hash
                        const activationHash = generatePassword(30, false);

                        //Preparing user data for DB
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            activationHash: activationHash
                        });

                        //Save user to DB
                        user.save()
                            .then(data => {
                                //Create activation link for email
                                const activationLink = `http://localhost:3000/users/activate-account/${activationHash}`;

                                //Send activation email
                                nodemailer.createTestAccount((err, account) => {
                                    let transporter = nodemailer.createTransport(HelpersController.mailConfig);

                                    let mailOptions = {
                                        from: '"Dev Test" <dev-test@admin.com>',
                                        to: req.body.email,
                                        subject: 'Account activation',
                                        html: `For account activation you need click this link - <a href='${activationLink}'>${activationLink}</a>`
                                    };

                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        }
                                    })
                                });

                                res.status(200).json({
                                    message: 'Please check your email for account activation'
                                });
                            })
                            .catch(err => HelpersController.errorResponse(res, err));
                    }
                });
            }
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.user_forgot_password = (req, res, next) => {
    //Search user by email
    User.find({email: req.body.email})
        .exec()
        .then(data => {
            if (data.length < 1) {
                return res.status(500).json({
                    data: null,
                    error: 'Email not found'
                });
            }

            //Generate new password
            const newPassword = generatePassword(10, false);

            //Send email
            nodemailer.createTestAccount((err, account) => {
                let transporter = nodemailer.createTransport(HelpersController.mailConfig);

                let mailOptions = {
                    from: '"Dev Test" <dev-test@admin.com>',
                    to: req.body.email,
                    subject: 'Reset password',
                    text: `Your new password is ${newPassword}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }

                    //Bcrypt new password
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                data: null,
                                error: err
                            });
                        } else {
                            //Save new password to DB
                            User.update({email: req.body.email}, {$set: {password: hash}})
                                .exec()
                                .then(data => {
                                    res.status(200).json({
                                        data: null,
                                        message: 'Please check you email'
                                    });
                                })
                                .catch(err => HelpersController.errorResponse(res, err));
                        }
                    });

                });
            });
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.user_activation_account = (req, res, next) => {
    const activationHash = req.params.activationHash;

    //Search user by email
    User.findOne({activationHash: activationHash})
        .exec()
        .then(data => {
            const updateObj = {
                active: 1,
                activationHash: null
            };

            //Activation user account
            User.update({_id: data._id}, {$set: updateObj})
                .exec()
                .then(data => {
                    res.render('layout', { body: 'Your account activation' });
                })
                .catch(err => {
                    res.render('error', { message: 'Invalid activation link' });
                });
        })
        .catch(err => {
            res.render('error', { message: 'Invalid activation link' });
        });
};

exports.get_user_by_id = (req, res, next) => {
    //Search user by id
    User.findOne({_id: req.params.id})
        .select('_id email firstName lastName')
        .exec()
        .then(user => {
            res.status(200).json({
                data: user
            });
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.update_user = (req, res, next) => {
    //Search user by id
    User.findOne({_id: req.params.id})
        .exec()
        .then(data => {
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

            //Update user by id
            const updateUser = (userData) => {
                User.update({_id: req.params.id}, {$set: userData})
                    .select('email firstName lastName')
                    .exec()
                    .then(user => {
                        res.status(200).json({
                            data: null,
                            message: 'User updated'
                        });
                    })
                    .catch(err => HelpersController.errorResponse(res, err));
            };

            if (userData.password.trim().length === 0) {
                delete userData.password;
                updateUser(userData);
            } else {
                //Bcrypt new password
                bcrypt.hash(userData.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            data: null,
                            error: err
                        });
                    } else {
                        userData.password = hash;
                        updateUser(userData);
                    }
                });
            }
        })
        .catch(err => HelpersController.errorResponse(res, err));
};
