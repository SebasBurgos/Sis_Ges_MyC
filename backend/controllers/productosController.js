// Contenido inicial para productosController.js 
// En productosController.js
const Plato = require('../models/producto'); // Asegúrate de que el nombre del archivo sea correcto si lo cambiaste
const { Op } = require('sequelize');

exports.filtrarProductos = async (req, res) => {
    try {
        const { minPrecio, maxPrecio } = req.query;
        const productos = await Producto.find({
            precio: { $gte: minPrecio || 0, $lte: maxPrecio || Infinity }
        });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para agregar un nuevo plato
exports.addPlato = async (req, res) => {
  try {
    const { nombre, categoria, precio, disponible, ingredientes, estilos_alimentarios } = req.body;
    const nuevoPlato = await Plato.create({ nombre, categoria, precio, disponible, ingredientes, estilos_alimentarios });
    res.status(201).json(nuevoPlato);
  } catch (error) {
    console.error('Error al agregar plato:', error);
    res.status(500).json({ message: 'Error interno del servidor al agregar plato.' });
  }
};

// Función para editar un plato existente
exports.updatePlato = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, disponible, ingredientes, estilos_alimentarios } = req.body;
    const plato = await Plato.findByPk(id);

    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado.' });
    }

    plato.nombre = nombre || plato.nombre;
    plato.categoria = categoria || plato.categoria;
    plato.precio = precio || plato.precio;
    plato.disponible = typeof disponible === 'boolean' ? disponible : plato.disponible;
    if (ingredientes && Array.isArray(ingredientes)) {
      plato.ingredientes = ingredientes;
    }
    if (estilos_alimentarios && Array.isArray(estilos_alimentarios)) {
      plato.estilos_alimentarios = estilos_alimentarios;
    }

    await plato.save();
    res.status(200).json(plato);
  } catch (error) {
    console.error('Error al editar plato:', error);
    res.status(500).json({ message: 'Error interno del servidor al editar plato.' });
  }
};

// Función para marcar un plato como no disponible
exports.markPlatoUnavailable = async (req, res) => {
  try {
    const { id } = req.params;
    const plato = await Plato.findByPk(id);

    if (!plato) {
      return res.status(404).json({ message: 'Plato no encontrado.' });
    }

    plato.disponible = false; // Marcar como no disponible
    await plato.save();
    res.status(200).json(plato);
  } catch (error) {
    console.error('Error al marcar plato como no disponible:', error);
    res.status(500).json({ message: 'Error interno del servidor al marcar plato como no disponible.' });
  }
};

// Función para buscar platos por nombre, tipo o estado (disponible/no disponible)
exports.searchPlatos = async (req, res) => {
  try {
    const { nombre, categoria, disponible } = req.query;
    let whereClause = {};

    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }
    if (categoria) {
      whereClause.categoria = categoria;
    }
    if (typeof disponible === 'string') {
      whereClause.disponible = (disponible.toLowerCase() === 'true');
    }

    const platos = await Plato.findAll({
      where: whereClause,
      attributes: ['id', 'nombre', 'categoria', 'precio', 'disponible', 'ingredientes', 'estilos_alimentarios'],
    });

    res.status(200).json(platos);
  } catch (error) {
    console.error('Error al buscar platos:', error);
    res.status(500).json({ message: 'Error interno del servidor al buscar platos.' });
  }
};