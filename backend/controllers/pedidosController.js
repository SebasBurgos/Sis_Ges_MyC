const Pedido = require('../models/pedido');
const Cliente = require('../models/usuario'); // Asegúrate de que el nombre del archivo sea correcto si lo cambiaste
const { Op, Sequelize } = require('sequelize');

// Función para registrar un nuevo pedido
exports.registrarPedido = async (req, res) => {
  try {
    const { cliente_id, fecha, platos_solicitados /* , mesa_id */ } = req.body; // Eliminar mesa_id aquí

    // Calcular el total del pedido
    let total = 0;
    if (platos_solicitados && platos_solicitados.length > 0) {
      total = platos_solicitados.reduce((sum, plato) => sum + (plato.cantidad * plato.precio_unitario), 0);
    }

    const nuevoPedido = await Pedido.create({
      cliente_id,
      fecha,
      total,
      platos_solicitados,
      // mesa_id, // Eliminar esta línea
    });

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error('Error al registrar pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar pedido.' });
  }
};

// Función para buscar pedidos por fecha o cliente
exports.buscarPedidos = async (req, res) => {
  try {
    const { fecha, cliente_id } = req.query;
    let whereClause = {};

    if (fecha) {
      whereClause.fecha = fecha;
    }
    if (cliente_id) {
      whereClause.cliente_id = cliente_id;
    }

    const pedidos = await Pedido.findAll({
      where: whereClause,
      include: [
        { model: Cliente, attributes: ['nombre', 'correo', 'telefono'] },
        // { model: Mesa, attributes: ['id', 'ubicacion', 'capacidad'] }, // Eliminar esta línea
      ],
    });

    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al buscar pedidos:', error);
    res.status(500).json({ message: 'Error interno del servidor al buscar pedidos.' });
  }
};

// Nueva función para obtener historial detallado de pedidos con filtros
exports.getDetailedOrderHistory = async (req, res) => {
  try {
    const { cliente_id, plato, fecha } = req.query;
    let whereClause = {};

    if (cliente_id) {
      whereClause.cliente_id = cliente_id;
    }
    if (fecha) {
      whereClause.fecha = fecha;
    }
    if (plato) {
      // Buscar el plato mencionado en el array de platos_solicitados (campo JSON)
      // Usamos Sequelize.literal con JSON_EXTRACT y LIKE para buscar dentro del JSON array
      whereClause[Op.and] = [
        Sequelize.literal(
          `JSON_EXTRACT(platos_solicitados, '$[*].nombre') LIKE '%${plato}%'`
        )
      ];
    }

    const pedidos = await Pedido.findAll({
      where: whereClause,
      include: [
        { model: Cliente, attributes: ['nombre', 'correo', 'telefono'] },
        // { model: Mesa, attributes: ['id', 'ubicacion', 'capacidad'] }, // Eliminar esta línea
      ],
    });

    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener historial de pedidos detallado:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener historial de pedidos.' });
  }
}; 