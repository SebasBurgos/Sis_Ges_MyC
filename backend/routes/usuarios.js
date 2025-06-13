const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Ruta para crear un nuevo cliente
router.post('/', usuariosController.createCliente);

// Ruta para obtener todos los clientes
router.get('/', usuariosController.getAllClientes);

// Ruta para obtener un cliente por ID
router.get('/:id', usuariosController.getClienteById);

// Ruta para actualizar un cliente por ID - PROTEGIDA: Solo administradores pueden cambiar roles
router.put('/:id', protect, authorizeRoles('administrador'), usuariosController.updateCliente);

// Ruta para eliminar un cliente por ID
router.delete('/:id', protect, authorizeRoles('administrador'), usuariosController.deleteCliente);

module.exports = router; 