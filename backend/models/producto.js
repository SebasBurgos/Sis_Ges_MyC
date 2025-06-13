// Contenido inicial para producto.js 
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plato = sequelize.define('Plato', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Por defecto, el plato está disponible
  },
  ingredientes: {
    type: DataTypes.TEXT, // Cambiado a TEXT para MySQL
    defaultValue: '[]', // Valor por defecto como JSON string vacío
    get() {
      const rawValue = this.getDataValue('ingredientes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('ingredientes', JSON.stringify(value));
    },
  },
  estilos_alimentarios: {
    type: DataTypes.TEXT, // Cambiado a TEXT para MySQL
    defaultValue: '[]', // Valor por defecto como JSON string vacío
    get() {
      const rawValue = this.getDataValue('estilos_alimentarios');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('estilos_alimentarios', JSON.stringify(value));
    },
  },
}, {
  tableName: 'platos', // Nombre de la tabla en la base de datos
  timestamps: false,
});

module.exports = Plato;