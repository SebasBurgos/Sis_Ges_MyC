// Contenido inicial para producto.js 
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    fecha_creacion: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;