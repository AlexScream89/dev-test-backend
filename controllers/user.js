const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generatePassword = require('password-generator');
const nodemailer = require('nodemailer');

const User = require('../models/user');

const mailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.email,
        pass: process.env.emailPassword
    },
    tls: {
        rejectUnauthorized: false
    }
};

exports.user_login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .exec()
        .then(data => {
            if (data.length < 1) {
                return res.status(401).json({
                    data: null,
                    message: 'Auth failed'
                });
            }

            const accountActive = data.active;
            bcrypt.compare(req.body.password, data.password, (err, data) =>  {
                if (err) {
                    return res.status(401).json({
                        data: null,
                        message: 'Auth failed'
                    });
                }

                if (!accountActive) {
                    return res.status(401).json({
                        data: null,
                        message: 'Your account not activated'
                    })
                }

                if (data) {
                    const token = jwt.sign(
                        {
                            email: data.email,
                            userId: data._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );

                    return res.status(200).json({
                        data: null,
                        message: 'Auth success',
                        token: token
                    })
                }
                res.status(401).json({
                    data: null,
                    message: 'Auth failed'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                data: null,
                error: err
            });
        });
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
    User.find({email: req.body.email})
        .exec()
        .then(data => {
            if (data.length >= 1) {
                res.status(409).json({
                    data: null,
                    message: 'Email exists'
                });
            } else {
                if (req.body.password !== req.body.repeatPassword) {
                    return res.status(500).json({
                        data: null,
                        message: 'Passwords must match'
                    });
                }

                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const activationHash = generatePassword(30, false);
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            activationHash: activationHash
                        });

                        user.save()
                            .then(data => {
                                const activationLink = `http://localhost:3000/users/activate-account/${activationHash}`;

                                nodemailer.createTestAccount((err, account) => {
                                    let transporter = nodemailer.createTransport(mailConfig);

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
                            .catch(err => {
                                res.status(500).json({
                                    data: null,
                                    error: err
                                });
                            });
                    }
                });
            }
        });
};

exports.user_forgot_password = (req, res, next) => {
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
                let transporter = nodemailer.createTransport(mailConfig);

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

                    //Save new password to DB
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                data: null,
                                error: err
                            });
                        } else {
                            User.update({email: req.body.email}, {$set: {password: hash}})
                                .exec()
                                .then(data => {
                                    res.status(200).json({
                                        data: null,
                                        message: 'Please check you email'
                                    });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        data: null,
                                        error: err
                                    });
                                });
                        }
                    });

                });
            });
        })
        .catch(err => {
            res.status(500).json({
                data: null,
                error: err
            });
        });
};

exports.user_activation_account = (req, res, next) => {
    const activationHash = req.params.activationHash;

    User.findOne({activationHash: activationHash})
        .exec()
        .then(data => {
            const updateObj = {
                active: 1,
                activationHash: null
            };

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
