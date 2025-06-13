const express = require('express');
const router = express.Router();
const preferenciasController = require('../controllers/preferenciasController');

console.log('Router de preferencias cargado y listo para recibir solicitudes.');

// Ruta para obtener todas las preferencias
router.get('/', preferenciasController.getAllPreferencias);

// Ruta para crear o actualizar las preferencias de un cliente
router.post('/', (req, res) => {
  console.log('Solicitud POST a /api/preferencias recibida en el enrutador.');
  preferenciasController.createOrUpdatePreferencia(req, res);
});
router.put('/:cliente_id', preferenciasController.createOrUpdatePreferencia); // También para actualizar

// Ruta para obtener las preferencias de un cliente por su ID
router.get('/:cliente_id', preferenciasController.getPreferenciaByClienteId);

module.exports = router; 