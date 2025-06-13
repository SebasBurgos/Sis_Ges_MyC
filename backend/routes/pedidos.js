const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');

// Ruta para registrar un nuevo pedido
router.post('/', pedidosController.registrarPedido);

// Ruta para buscar pedidos por fecha o cliente
router.get('/', pedidosController.buscarPedidos);

// Nueva ruta para obtener historial detallado de pedidos con filtros (cliente, plato, fecha)
router.get('/historial', pedidosController.getDetailedOrderHistory);

module.exports = router; 