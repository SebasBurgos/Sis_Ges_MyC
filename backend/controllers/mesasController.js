const Mesa = require('../models/mesa');

// Crear una nueva mesa
exports.createMesa = async (req, res) => {
  try {
    const nuevaMesa = await Mesa.create(req.body);
    res.status(201).json(nuevaMesa);
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear mesa.' });
  }
};

// Obtener todas las mesas
exports.getAllMesas = async (req, res) => {
  try {
    const mesas = await Mesa.findAll();
    res.status(200).json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener mesas.' });
  }
}; 