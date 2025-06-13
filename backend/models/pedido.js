const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Cliente = require('./usuario'); // El modelo Cliente que ya definimos

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Cliente,
      key: 'id',
    },
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Almacenaremos los platos solicitados como un JSON array de objetos
  // Cada objeto puede tener { plato_id: X, cantidad: Y, precio_unitario: Z }
  platos_solicitados: {
    type: DataTypes.JSON, // Para MySQL, esto se mapea a JSON
    allowNull: false,
  },
}, {
  tableName: 'pedidos',
  timestamps: false,
});

// Definir las relaciones
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Cliente.hasMany(Pedido, { foreignKey: 'cliente_id' });

module.exports = Pedido; 