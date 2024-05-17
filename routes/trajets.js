var express = require('express');
var router = express.Router();
const moment = require('moment');

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

// Définition de la route '/' permettant d'obtenir les trajets disponibles (30 max) pour une date donnée
//cette route en get utilise req.query pour recuperer les parametres de la requete
router.get('/recherche', async (req , res) => {
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
            // Recherche les trajets dont la date de départ est supérieure à la date de la requête
            date: { $gt: requestDate.toDate() }
        }).limit(30).exec();
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

    //definition de la route '/bookings' permettant de placer un trajet dans cart
    //toute les routes en post utilise req.body pour recuperer les parametres de la requete

    router.post('/ajouteraupanier',  (req, res) => {
        Trajet.findOneAndUpdate({ _id  : req.body.id }, { reservationStatus : 'cart' }, { new : true })
        .then(data => { 
            if(data === null){
                res.json({ result : false, error : 'No trajet found'});
            } else {
                res.json({ result : true, trajet : data });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });

    //route permettant d'annuler une reservation
    router.post('/enleverdupanier', (req, res) => {
        Trajet.findOneAndUpdate({ _id  : req.body.id , reservationStatus : 'cart' }, { reservationStatus : 'réservable' }, { new : true })
        .then(data => {
            if(data === null){
                res.json({ result : false, error : 'No trajet found'});
            } else {
                res.json({ result : true, trajet : data });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });

    router.get('/contenudupanier', (req, res) => {
        Trajet.find({ reservationStatus : 'cart' })
        .then(data => {
            res.json({ result : true, trajets : data });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });
    
    //route permettant de valider une reservation 
    //a modifier pour que cela boucle sur tout les elements avec reservationsstatus cart
    
    router.get('/validerlacommande', (req, res) => {
        Trajet.updateMany({ reservationStatus : 'cart' }, { reservationStatus : 'booked' })
        .then(data => {
            res.json({ result : true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });
    //route permettant de recuperer les trajets dans le panier
    //route permettant de recuperer les trajets reserves
    router.get('/trajetbooked', (req, res) => {
        //voir si on gere en back ou front les dates dépassés
        Trajet.find({ reservationStatus : 'booked' })
        .then(data => {
            res.json({ result : true, trajets : data });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });

    //route reinitialisant les trajets booked (pour les tests)

    router.get('/reset', (req, res) => {
        Trajet.updateMany({ reservationStatus : 'booked' }, { reservationStatus : 'réservable' })
        .then(data => {
            res.json({ result : true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error : 'Internal server error'});
        });
    });

module.exports = router;