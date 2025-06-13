const Preferencia = require('../models/preferencia');

// Función para crear o actualizar las preferencias de un cliente
exports.createOrUpdatePreferencia = async (req, res) => {
  try {
    const { cliente_id, intolerancias, estilos_preferidos } = req.body;

    let preferencia = await Preferencia.findOne({ cliente_id });

    if (preferencia) {
      // Si ya existe, actualiza y añade a los arreglos existentes
      preferencia.intolerancias = [...new Set([...preferencia.intolerancias, ...intolerancias])];
      preferencia.estilos_preferidos = [...new Set([...preferencia.estilos_preferidos, ...estilos_preferidos])];
      console.log('Intentando actualizar preferencia con datos:', preferencia);
      await preferencia.save();
      res.status(200).json(preferencia);
    } else {
      // Si no existe, crea una nueva
      console.log('Intentando crear nueva preferencia con datos:', { cliente_id, intolerancias, estilos_preferidos });
      preferencia = await Preferencia.create({ cliente_id, intolerancias, estilos_preferidos });
      res.status(201).json(preferencia);
    }
  } catch (error) {
    console.error('Error al crear o actualizar preferencia:', error);
    res.status(500).json({ message: 'Error interno del servidor al gestionar preferencias.' });
  }
};

// Función para obtener las preferencias de un cliente por su ID
exports.getPreferenciaByClienteId = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const preferencia = await Preferencia.findOne({ cliente_id });

    if (!preferencia) {
      return res.status(404).json({ message: 'Preferencias no encontradas para este cliente.' });
    }

    res.status(200).json(preferencia);
  } catch (error) {
    console.error('Error al obtener preferencia:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener preferencias.' });
  }
};

// Nueva función para obtener todas las preferencias
exports.getAllPreferencias = async (req, res) => {
  try {
    const preferencias = await Preferencia.find({}).select('+createdAt +updatedAt');
    res.status(200).json(preferencias);
  } catch (error) {
    console.error('Error al obtener todas las preferencias:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener todas las preferencias.' });
  }
}; 