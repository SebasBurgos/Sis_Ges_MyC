const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Ruta para crear una nueva reserva
router.post('/', reservasController.crearReserva);

// Ruta para verificar la disponibilidad de mesas
router.get('/disponibilidad', reservasController.verificarDisponibilidad);

// Ruta para obtener reservas (filtradas por fecha o cliente)
router.get('/', reservasController.obtenerReservas);

module.exports = router; 