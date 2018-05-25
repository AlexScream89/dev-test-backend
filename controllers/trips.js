const mongoose = require('mongoose');
const mockTrips = require('../mock/trips');

const HelpersController = require('./helpers');
const Trip = require('../models/trip');
const Place = require('../models/place');

exports.get_trips = (req, res, next) => {
    Trip.find()
        .populate('places')
        .exec()
        .then(data => {
            res.status(200).json({
                data: data
            });
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.trips_create = (req, res, next) => {
    const trip = new Trip({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title
    });
    trip.save()
        .then(data => {
            const place = new Place({
                trip: data._id,
                imageUrl: 'https://media.istockphoto.com/photos/portrait-of-young-woman-in-car-looking-at-map-picture-id540529776?k=6&m=540529776&s=612x612&w=0&h=amo6VRUjjAwHCvChzcvE2eGco8z22E_8qMF35cgEMqk=',
                country: 'Italy',
                city: 'Milan',
                beginAt: new Date(),
                endAt: new Date()
            });
            place.save()
                .then(result => {
                    console.log('push place');
                    trip.places.push(place);
                    trip.save()
                        .then(data => {
                            res.status(200).json({
                                data: data
                            });
                        })
                        .catch(err => HelpersController.errorResponse(res, err));
                })
                .catch(err => HelpersController.errorResponse(res, err));
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.get_trip_by_id = (req, res, next) => {
    Trip.findOne({_id: req.params.id})
        .populate('places')
        .exec()
        .then(data => {
            res.status(200).json({
                data: data
            });
        })
        .catch(err => HelpersController.errorResponse(res, err));
};

exports.upload_image = (req, res, next) => {
    const host = req.headers.host;
    const filePath = req.file.path;
    res.status(200).json({
        data: `${host}/${filePath}`
    });
};
