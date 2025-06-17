// Contenido inicial para api.js 
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api' // Ajusta el puerto según tu backend
});

export const getUsuarios = () => api.get('/usuarios');
export const createUsuario = (usuario) => api.post('/usuarios', usuario);

export const getProductos = () => api.get('/productos');
export const createProducto = (producto) => api.post('/productos', producto);