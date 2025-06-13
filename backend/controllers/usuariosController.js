const Cliente = require('../models/usuario');

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const nuevoCliente = await Cliente.create(req.body);
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear cliente.' });
  }
};

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener clientes.' });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener cliente.' });
  }
};

// Actualizar un cliente por ID
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Cliente.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedCliente = await Cliente.findByPk(id);
      return res.status(200).json(updatedCliente);
    }
    throw new Error('Cliente no encontrado o no se pudo actualizar.');
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar cliente.' });
  }
};

// Eliminar un cliente por ID
exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cliente.destroy({
      where: { id: id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Cliente eliminado exitosamente.' });
    }
    throw new Error('Cliente no encontrado o no se pudo eliminar.');
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar cliente.' });
  }
}; 