const mongoose = require('mongoose');

const preferenciaSchema = new mongoose.Schema({
  cliente_id: {
    type: String, // Cambiado de mongoose.Schema.Types.ObjectId a String
    ref: 'Cliente', // Esto es solo referencial si los clientes están en la BD relacional
    required: true,
    unique: true, // Un cliente solo tiene un conjunto de preferencias
  },
  intolerancias: {
    type: [String], // Array de intolerancias (ej: 'lactosa', 'gluten')
    default: [],
  },
  estilos_preferidos: {
    type: [String], // Array de estilos de comida preferidos (ej: 'vegetariano', 'vegano', 'picante')
    default: [],
  },
}, { timestamps: true, strict: true });

const Preferencia = mongoose.model('Preferencia', preferenciaSchema);

module.exports = Preferencia; 