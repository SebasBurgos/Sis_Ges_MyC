const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./usuario'); // Renombrado a Cliente en este contexto
const Mesa = require('./mesa');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha: {
    type: DataTypes.DATEONLY, // Solo la fecha
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME, // Solo la hora
    allowNull: false,
  },
  numero_personas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Foreign keys
  cliente_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Cliente, // Hace referencia al modelo Cliente
      key: 'id',
    },
    allowNull: false,
  },
  mesa_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Mesa, // Hace referencia al modelo Mesa
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'reservas', // Nombre de la tabla en la base de datos
  timestamps: false,
});

module.exports = Reserva; 