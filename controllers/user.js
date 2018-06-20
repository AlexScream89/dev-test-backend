const bcrypt = require('bcrypt');

const User = require('../models/user');
const ErrorController = require('./error');
const ValidationController = require('./validation');

exports.get_user_by_id = async (req, res, next) => {
    try {
        //Search user by id
        const user = await User.findOne({_id: req.params.id}).select('_id email firstName lastName').exec();
        res.status(200).json({
            data: user
        });
    } catch (err) {
        ErrorController.errorResponse(res, err);
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
        const matchPSW = ValidationController.matchPasswords(res, userData.password, req.body.repeatPassword);
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
        ErrorController.errorResponse(res, err);
    }
};
