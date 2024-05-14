var express = require('express');
var router = express.Router();
const moment = require('moment');
const fetch = require('node-fetch');
//on a peut etre pas besoin de node fetch, a voir
const Trajet = require('../models/trajet');

// Définition de la route '/test'
router.get('/test', (req, res) => {
    // Recherche des 10 premiers trajets dans la base de données
    Trajet.find().limit(10).exec()
        .then(data => {
            // En cas de succès, renvoie les données au client sous forme de JSON
            res.json({trajets : data});
        })
        .catch(err => {
            // En cas d'erreur, affiche l'erreur dans la console et renvoie une réponse d'erreur au client
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

// Définition de la route '/'
router.get('/', async (req , res) => {
    // Vérifie si les champs 'departure', 'arrival' et 'date' sont présents dans la requête
    if (!req.query.departure || !req.query.arrival || !req.query.date) {
        // Si un ou plusieurs champs sont manquants, renvoie une réponse d'erreur au client
        res.json({ result : false, error: 'missing or empty fields'});
        return;
    }
    // Convertit la date de la requête en un objet moment
    const requestDate = moment(req.query.date);
    // Obtient la date actuelle
    const today = moment();
    // Vérifie si la date de la requête est valide
    if (!requestDate.isValid()) {
        // Si la date n'est pas valide, renvoie une réponse d'erreur au client
        res.json({ result: false, error: 'invalid date format'});
        return;
    }
    // Vérifie si la date de la requête est dans le passé
    if (requestDate.isBefore(today)) {
        // Si la date est dans le passé, renvoie une réponse d'erreur au client
        res.json({ result: false, error: 'date is in the past'});
        return;
    }
    try {
        // Recherche des trajets dans la base de données qui correspondent aux critères de la requête
        const trajets = await Trajet.find({
            departure: req.query.departure,
            arrival: req.query.arrival,
            date: { $gt: today.toDate() }
        }).limit(10).exec();
        // Vérifie si des trajets ont été trouvés
        if (trajets === null || trajets.length === 0) {
            // Si aucun trajet n'a été trouvé, renvoie une réponse d'erreur au client
            res.json({ result: false, error: 'No trajets found'});
        } else {
            // Si des trajets ont été trouvés, renvoie les trajets au client
            res.json({ result: true, trajets: trajets });
        }
    } catch (error) {
        // En cas d'erreur lors de la recherche des trajets, affiche l'erreur dans la console et renvoie une réponse d'erreur au client
        console.error("Error fetching trajets:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;