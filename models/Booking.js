const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    campground: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campground',
        required: [true, 'Please add a campground'],
    },
    bookDate: {
        type: Date,
        required: [true, 'Please add a date'],
    },
    time: {
        type: String,
        required: [true, 'Please add a time'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Booking', BookingSchema);
