const mongoose = require('mongoose');

const trajetSchema = mongoose.Schema({
    departure : String,
    arrival : String,
    date : { type: Date, default: Date.now },
    price : Number,
    reservationStatus : {
        type: String,
        enum: ['réservable', 'cart', 'booked'],
        default: 'réservable'
    }
});

const Trajet = mongoose.model('tickets', trajetSchema);

module.exports = Trajet;