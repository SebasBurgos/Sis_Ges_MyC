const Resena = require('../models/resena');
const Cliente = require('../models/usuario'); // Asumiendo que tu modelo de usuario es 'usuario'
const Plato = require('../models/producto');   // Asumiendo que tu modelo de producto es 'producto'

// Función para registrar una nueva reseña
exports.registrarResena = async (req, res) => {
  try {
    const { cliente_id, valoracion, comentario, plato_id, tipo_visita } = req.body;

    const nuevaResena = await Resena.create({
      cliente_id,
      valoracion,
      comentario,
      plato_id: plato_id || null, // Asegurar que sea null si no se proporciona
      tipo_visita: tipo_visita || null, // Asegurar que sea null si no se proporciona
    });

    res.status(201).json(nuevaResena);
  } catch (error) {
    console.error('Error al registrar reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar reseña.' });
  }
};

// Función para obtener y filtrar reseñas
exports.getResenas = async (req, res) => {
  try {
    const { calificacion, plato_id, cliente_nombre, plato_nombre, fecha, tipo_visita } = req.query;
    let query = {};

    if (calificacion) {
      query.valoracion = parseInt(calificacion);
    }
    if (plato_id) {
      query.plato_id = parseInt(plato_id); // Asegurar que el plato_id sea un número
    }

    if (cliente_nombre) {
      const cliente = await Cliente.findOne({ nombre: { $regex: cliente_nombre, $options: 'i' } });
      if (cliente) {
        query.cliente_id = cliente.id;
      } else {
        // Si no se encuentra el cliente, no hay reseñas para ese nombre
        return res.status(200).json([]);
      }
    }

    if (plato_nombre) {
      const plato = await Plato.findOne({ nombre: { $regex: plato_nombre, $options: 'i' } });
      if (plato) {
        query.plato_id = plato.id; // Aquí se asume que los IDs de platos también son números
      } else {
        // Si no se encuentra el plato, no hay reseñas para ese nombre
        return res.status(200).json([]);
      }
    }

    if (fecha) {
      const startOfDay = new Date(fecha);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.fecha = { $gte: startOfDay, $lt: endOfDay };
    }

    if (tipo_visita) {
      query.tipo_visita = { $regex: tipo_visita, $options: 'i' };
    }

    const resenas = await Resena.find(query);

    // Mapear _id a id para el frontend
    const formattedResenas = resenas.map(resena => ({
      id: resena._id,
      cliente_id: resena.cliente_id,
      valoracion: resena.valoracion,
      comentario: resena.comentario,
      plato_id: resena.plato_id,
      tipo_visita: resena.tipo_visita,
      fecha: resena.fecha,
    }));

    res.status(200).json(formattedResenas);
  } catch (error) {
    console.error('Error al obtener/filtrar reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener/filtrar reseñas.' });
  }
}; 