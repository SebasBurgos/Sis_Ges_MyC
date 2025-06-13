// Contenido inicial para app.js 
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors'); // Importar el paquete cors
const { sequelize, connectDB } = require('./config/db');
const mongoose = require('mongoose');

mongoose.set('debug', true); // MOVIDA AQUÍ: Activar el modo de depuración de Mongoose al principio

// Importar modelos para la sincronización de Sequelize
const Cliente = require('./models/usuario');
const Mesa = require('./models/mesa');
const Plato = require('./models/producto');
const Pedido = require('./models/pedido');
const Reserva = require('./models/reserva');
const Resena = require('./models/resena'); // Modelo NoSQL, no se sincroniza con Sequelize
const Preferencia = require('./models/preferencia'); // Importar el modelo de Preferencias

// Definir asociaciones de Sequelize aquí
Reserva.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'Cliente' });
Reserva.belongsTo(Mesa, { foreignKey: 'mesa_id', as: 'Mesa' });
Cliente.hasMany(Reserva, { foreignKey: 'cliente_id', as: 'Reservas' });
Mesa.hasMany(Reserva, { foreignKey: 'mesa_id', as: 'Reservas' });

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const reservasRoutes = require('./routes/reservas');
const resenasRoutes = require('./routes/resenas');
const preferenciasRoutes = require('./routes/preferencias'); // Importar las rutas de preferencias
console.log('Valor de preferenciasRoutes después de importar:', preferenciasRoutes); // AÑADIR ESTA LÍNEA
const mesasRoutes = require('./routes/mesas'); // Importar las rutas de mesas
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Usar cors middleware: Esto permite todas las peticiones de cualquier origen.
                  // Para producción, es recomendable configurarlo para orígenes específicos.

// Rutas
app.get('/', (req, res) => {
  res.send('¡Bienvenido al Backend del Sistema de Gestión de Restaurante MyC!');
});
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/resenas', resenasRoutes);
console.log('Intentando usar preferenciasRoutes para /api/preferencias');
app.use('/api/preferencias', preferenciasRoutes); // Usar las rutas de preferencias
app.use('/api/mesas', mesasRoutes); // Usar las rutas de mesas
app.use('/api/auth', authRoutes); // Usar las rutas de autenticación

// Manejo de errores (opcional, puedes expandir esto)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

const PORT = process.env.PORT || 3000;

// Sincronizar modelos con la base de datos y luego iniciar el servidor
async function startServer() {
  try {
    await connectDB(); // Conectar a MySQL y MongoDB
    
    // Sincronizar modelos de Sequelize (solo para MySQL)
    // Esto creará las tablas si no existen
    await sequelize.sync({ alter: true }); // 'alter: true' intentará hacer cambios en la tabla existente para que coincida con el modelo
    console.log('Modelos de Sequelize sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1); // Salir con error
  }
}

startServer(); 