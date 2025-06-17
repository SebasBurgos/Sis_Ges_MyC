import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, onGoToRegister }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        correo,
        password,
      });

      // Almacenar el token y la información del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onLoginSuccess(response.data.user); // Llamar a la función de éxito y pasar el usuario

    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Mostrar mensaje de error del servidor
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="content-container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
        <p>
          ¿No tienes una cuenta? <button type="button" onClick={onGoToRegister}>Regístrate aquí</button>
        </p>
      </form>
    </div>
  );
};

export default Login; 