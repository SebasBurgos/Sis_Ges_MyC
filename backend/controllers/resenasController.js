const Resena = require('../models/resena');

// Función para registrar una nueva reseña
exports.registrarResena = async (req, res) => {
  try {
    const { cliente_id, valoracion, comentario, plato_id } = req.body;

    const nuevaResena = await Resena.create({
      cliente_id,
      valoracion,
      comentario,
      plato_id: plato_id || null,
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
    const { calificacion, plato_id } = req.query;
    let query = {};

    if (calificacion) {
      query.valoracion = parseInt(calificacion);
    }
    if (plato_id) {
      query.plato_id = plato_id;
    }

    const resenas = await Resena.find(query);
    res.status(200).json(resenas);
  } catch (error) {
    console.error('Error al obtener/filtrar reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener/filtrar reseñas.' });
  }
}; 