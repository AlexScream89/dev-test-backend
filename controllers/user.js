const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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
            bcrypt.compare(req.body.password, data.password, (err, data) =>  {
                if (err) {
                    return res.status(401).json({
                        data: null,
                        message: 'Auth failed'
                    });
                }
                if (data) {
                    console.log('token', process.env.JWT_KEY);
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
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName
                        });

                        user.save()
                            .then(data => {
                                res.status(200).json(data);
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