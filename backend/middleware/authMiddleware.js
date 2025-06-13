const jwt = require('jsonwebtoken');
const Cliente = require('../models/usuario'); // Asumiendo que tu modelo de usuario es 'usuario'

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey'); // Usa una clave secreta de tu entorno

      // Adjuntar usuario del token
      req.user = await Cliente.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado.' });
      }

      next();
    } catch (error) {
      console.error('Error en la autenticación:', error);
      res.status(401).json({ message: 'Token no autorizado, token fallido.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: `El usuario con rol ${req.user ? req.user.rol : 'desconocido'} no está autorizado para acceder a esta ruta.` });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles }; 