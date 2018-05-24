const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    places: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }]
});

module.exports = mongoose.model('Trip', tripSchema);
