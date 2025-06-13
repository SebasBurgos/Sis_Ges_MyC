const Reserva = require('../models/reserva');
const Cliente = require('../models/usuario'); // Asegúrate de que el nombre del archivo sea correcto si lo cambiaste
const Mesa = require('../models/mesa');
const { Op } = require('sequelize');

// Función para registrar una nueva reserva
exports.crearReserva = async (req, res) => {
  try {
    const { cliente_id, mesa_id, fecha, hora, numero_personas } = req.body;

    // Verificar si la mesa y el cliente existen
    const mesaExistente = await Mesa.findByPk(mesa_id);
    const clienteExistente = await Cliente.findByPk(cliente_id);

    if (!mesaExistente) {
      return res.status(404).json({ message: 'Mesa no encontrada.' });
    }
    if (!clienteExistente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }

    // Validar capacidad de la mesa
    if (mesaExistente.capacidad < parseInt(numero_personas)) {
      return res.status(400).json({ message: 'La mesa seleccionada no tiene capacidad suficiente para el número de personas.' });
    }

    // Verificar disponibilidad de la mesa para la fecha y hora
    const reservasExistentes = await Reserva.findAll({
      where: {
        mesa_id: mesa_id,
        fecha: fecha,
        hora: hora,
      },
    });

    if (reservasExistentes.length > 0) {
      return res.status(409).json({ message: 'La mesa ya está reservada para esta fecha y hora.' });
    }

    const nuevaReserva = await Reserva.create({
      cliente_id,
      mesa_id,
      fecha,
      hora,
      numero_personas,
    });

    res.status(201).json(nuevaReserva);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear reserva.' });
  }
};

// Función para verificar la disponibilidad de mesas
exports.verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora, numero_personas } = req.query;

    if (!fecha || !hora || !numero_personas) {
      return res.status(400).json({ message: 'Se requieren fecha, hora y número de personas para verificar disponibilidad.' });
    }

    // Encontrar todas las mesas
    const todasLasMesas = await Mesa.findAll();

    // Encontrar mesas ocupadas para la fecha y hora dadas
    const mesasOcupadas = await Reserva.findAll({
      attributes: ['mesa_id'],
      where: {
        fecha: fecha,
        hora: hora,
      },
      group: ['mesa_id'],
    });

    const idsMesasOcupadas = mesasOcupadas.map(reserva => reserva.mesa_id);

    // Encontrar mesas disponibles que cumplan con la capacidad y no estén ocupadas
    const mesasDisponibles = await Mesa.findAll({
      where: {
        id: {
          [Op.notIn]: idsMesasOcupadas,
        },
        capacidad: {
          [Op.gte]: parseInt(numero_personas),
        },
      },
    });

    res.status(200).json(mesasDisponibles);
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ message: 'Error interno del servidor al verificar disponibilidad.' });
  }
};

// Función para obtener reservas filtradas por fecha o cliente
exports.obtenerReservas = async (req, res) => {
  try {
    const { fecha, cliente_id } = req.query;
    let whereClause = {};

    if (fecha) {
      whereClause.fecha = fecha;
    }
    if (cliente_id) {
      whereClause.cliente_id = cliente_id;
    }

    const reservas = await Reserva.findAll({
      where: whereClause,
      include: [
        { model: Cliente, as: 'Cliente', attributes: ['nombre', 'correo', 'telefono'] },
        { model: Mesa, as: 'Mesa', attributes: ['capacidad', 'ubicacion'] }
      ],
    });

    console.log('Reservas enviadas al frontend:', JSON.stringify(reservas, null, 2));

    res.status(200).json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener reservas.' });
  }
}; 