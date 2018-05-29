const mongoose = require('mongoose');
const mockTrips = require('../mock/trips');

const HelpersController = require('./helpers');
const Trip = require('../models/trip');
const Place = require('../models/place');

const imgUrl = 'https://media.istockphoto.com/photos/portrait-of-young-woman-in-car-looking-at-map-picture-id540529776?k=6&m=540529776&s=612x612&w=0&h=amo6VRUjjAwHCvChzcvE2eGco8z22E_8qMF35cgEMqk=';

exports.get_trips = async (req, res, next) => {
    try {
        const trip = await Trip.find().populate('places').exec();
        res.status(200).json({
            data: trip
        });
    } catch (err) {
        HelpersController.errorResponse(res, err)
    }
};

exports.trips_create = async (req, res, next) => {
    const trip = new Trip({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        places: req.body.places
    });

    try {
        const savedTrip = await trip.save();
        res.status(200).json({
            data: savedTrip
        });
    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};

exports.get_trip_by_id = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({_id: req.params.id}).populate('places').exec();
        res.status(200).json({
            data: trip
        });
    } catch (err) {
        HelpersController.errorResponse(res, err);
    }
};

exports.upload_image = (req, res, next) => {
    const host = req.headers.host;
    const filePath = req.file.path;
    res.status(200).json({
        data: `${host}/${filePath}`
    });
};
