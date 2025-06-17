import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegisterSuccess, onGoToLogin }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        nombre,
        correo,
        telefono,
        password,
        rol: 'cliente', // Rol por defecto para el registro de clientes
      });

      setSuccess(response.data.message || 'Registro exitoso!');
      // Opcional: limpiar los campos después del registro exitoso
      setNombre('');
      setCorreo('');
      setTelefono('');
      setPassword('');
      
      // Si se proporcionó una función de éxito, llamarla después de un breve retardo
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else if (onGoToLogin) {
          onGoToLogin(); // Redirigir al login si no hay onRegisterSuccess
        }
      }, 1500); // Retardo para que el usuario vea el mensaje de éxito

    } catch (err) {
      console.error('Error de registro:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message); // Mostrar mensaje de error del servidor
      } else {
        setError('Error al registrar el usuario. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="content-container">
      <h1>Registrar Cliente</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
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
          <label htmlFor="telefono">Teléfono (opcional):</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
        <button type="submit">Registrarse</button>
        <p>
          ¿Ya tienes una cuenta? <button type="button" onClick={onGoToLogin}>Inicia Sesión aquí</button>
        </p>
      </form>
    </div>
  );
};

export default Register; 