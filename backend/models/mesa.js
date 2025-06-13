const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'mesas', // Nombre de la tabla en la base de datos
  timestamps: false,
});

module.exports = Mesa; 