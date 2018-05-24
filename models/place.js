const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
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
});

module.exports = mongoose.model('Place', placeSchema);