const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  cliente_id: {
    type: Number,
    required: true,
  },
  valoracion: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comentario: {
    type: String,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

const Resena = mongoose.model('Resena', resenaSchema);

module.exports = Resena; 