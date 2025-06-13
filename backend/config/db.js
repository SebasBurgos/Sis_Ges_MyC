// Contenido inicial para db.js 
// MySQL Connection
const { Sequelize } = require('sequelize');

// Configuración de la base de datos relacional (MySQL) desde variables de entorno
const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
  logging: false, // Puedes cambiar a true para ver los logs de SQL
});

// MongoDB Connection
const mongoose = require('mongoose');

// Configuración de la base de datos NoSQL (MongoDB) desde variables de entorno
const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida exitosamente.');

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB establecida exitosamente.');

  } catch (error) {
    console.error('Error al conectar a las bases de datos:', error);
  }
};

module.exports = { sequelize, connectDB };