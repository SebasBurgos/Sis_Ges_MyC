const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

// Ruta para agregar un nuevo plato
router.post('/', productosController.addPlato);

// Ruta para editar un plato existente
router.put('/:id', productosController.updatePlato);

// Ruta para marcar un plato como no disponible
router.put('/:id/unavailable', productosController.markPlatoUnavailable);

// Ruta para buscar platos por nombre, tipo o estado
router.get('/', productosController.searchPlatos);

module.exports = router; 