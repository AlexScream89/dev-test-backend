const mongoose = require('mongoose');

exports.get_settings = (req, res, next) => {
    res.status(200).json({
        message: 'Settings page works!'
    });
};