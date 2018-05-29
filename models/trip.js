const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    places: [{
        imageUrl: {
            type: String
        },
        country: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        beginAt: {
            type: Date,
            required: true
        },
        endAt: {
            type: Date,
            required: true
        }
    }]
});

module.exports = mongoose.model('Trip', tripSchema);
