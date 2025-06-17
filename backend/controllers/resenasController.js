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
    const { calificacion, plato_id, cliente_nombre, plato_nombre, fecha } = req.query;
    let query = {};

    if (calificacion) {
      query.valoracion = parseInt(calificacion);
    }
    if (plato_id) {
      query.plato_id = plato_id;
    }
    if (cliente_nombre) {
      // Aquí necesitarías lógica para buscar el cliente por nombre y obtener su ID
      // Para este ejemplo, asumiremos que tienes un modelo Cliente y puedes buscarlo
      // Si no tienes esta funcionalidad, es un paso a implementar en el backend.
      // Por ahora, simplemente ignoraremos este filtro o lo haríamos buscar en el frontend.
      // Para simplificar, si no hay un modelo de cliente directamente enlazado, se requeriría más trabajo.
      // Por ahora, solo se usará si el `cliente_id` es pasado.
    }
    if (plato_nombre) {
      // Similar al cliente, necesitarías buscar el plato por nombre y obtener su ID
      // Por ahora, ignoraremos este filtro en el backend si no hay una forma directa.
    }
    if (fecha) {
      // Asumiendo que `fecha` se guarda como Date y el formato de `req.query.fecha` es compatible
      query.fecha = { $gte: new Date(fecha), $lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1)) };
    }

    const resenas = await Resena.find(query);
    
    // Mapear _id a id para el frontend
    const formattedResenas = resenas.map(resena => ({
      id: resena._id,
      cliente_id: resena.cliente_id,
      valoracion: resena.valoracion,
      comentario: resena.comentario,
      plato_id: resena.plato_id,
      fecha: resena.fecha, // Asegúrate de incluir la fecha si la quieres en el frontend
    }));

    res.status(200).json(formattedResenas);
  } catch (error) {
    console.error('Error al obtener/filtrar reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener/filtrar reseñas.' });
  }
}; 