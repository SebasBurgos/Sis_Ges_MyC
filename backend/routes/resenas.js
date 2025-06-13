const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenasController');

// Ruta para registrar una nueva reseña
router.post('/', resenasController.registrarResena);

// Ruta para obtener y filtrar reseñas
router.get('/', resenasController.getResenas);

module.exports = router; 