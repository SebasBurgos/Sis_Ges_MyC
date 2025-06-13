const Cliente = require('../models/usuario'); // Asegúrate de que el modelo sea el correcto
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { nombre, correo, telefono, password, rol } = req.body;

    // Validar si el correo ya existe
    const existingUser = await Cliente.findOne({ where: { correo } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const nuevoCliente = await Cliente.create({ nombre, correo, telefono, password, rol });
    res.status(201).json({ message: 'Usuario registrado con éxito!', userId: nuevoCliente.id });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const cliente = await Cliente.findOne({ where: { correo } });
    if (!cliente) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await cliente.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id: cliente.id, rol: cliente.rol },
      process.env.JWT_SECRET || 'supersecretjwtkey', // Usa una variable de entorno en producción
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso!',
      token,
      user: { id: cliente.id, nombre: cliente.nombre, correo: cliente.correo, rol: cliente.rol }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
  }
}; 