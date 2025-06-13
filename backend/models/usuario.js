// Contenido inicial para usuario.js 
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs'); // Importar bcryptjs

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telefono: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING,
    defaultValue: 'cliente', // Rol por defecto
  },
}, {
  tableName: 'clientes', // Nombre de la tabla en la base de datos
  timestamps: false, // Si no quieres que Sequelize añada createdAt y updatedAt
  hooks: {
    beforeCreate: async (cliente) => {
      const salt = await bcrypt.genSalt(10);
      cliente.password = await bcrypt.hash(cliente.password, salt);
    },
  },
});

// Método para comparar contraseñas
Cliente.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Cliente;