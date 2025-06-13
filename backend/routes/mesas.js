const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');

// Ruta para crear una nueva mesa
router.post('/', mesasController.createMesa);

// Ruta para obtener todas las mesas
router.get('/', mesasController.getAllMesas);

module.exports = router; 