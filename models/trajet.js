const mongoose = require('mongoose');

const trajetSchema = mongoose.Schema({
    departure : String,
    arrival : String,
    //si on doit rajouter un trajet un jour , en oubliant la date, elle sera automatiquement ajoutée à la date du jour
    //la date dans la base de donnée est dans un objet , je rajoute { type: Date, default: Date.now }
    date : { type: Date, default: Date.now },
    price : Number,
});

const Trajet = mongoose.model('tickets', trajetSchema);

module.exports = Trajet;