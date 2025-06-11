// Contenido inicial para usuario.js 
const { mysqlPool } = require('../config/db');

class Usuario {
    static async crear(nombre, email) {
        const [result] = await mysqlPool.query(
            'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
            [nombre, email]
        );
        return result.insertId;
    }

    static async obtenerTodos() {
        const [rows] = await mysqlPool.query('SELECT * FROM usuarios');
        return rows;
    }
}

module.exports = Usuario;