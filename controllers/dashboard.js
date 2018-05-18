const mongoose = require('mongoose');

exports.get_dashboard = (req, res, next) => {
    res.status(200).json({
        message: 'Dashboard page works!'
    });
};