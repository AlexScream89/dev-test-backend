const mongoose = require('mongoose');
const mockTrips = require('../mock/trips');

exports.get_trips = (req, res, next) => {
    res.status(200).json({
        data: mockTrips
    });
};