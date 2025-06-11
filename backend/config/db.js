// Contenido inicial para db.js 
// MySQL Connection
const mysql = require('mysql2/promise');

const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

// MongoDB Connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

module.exports = { mysqlPool, mongoose };