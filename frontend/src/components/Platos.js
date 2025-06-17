import React, { useState, useEffect } from 'react';

function Platos({ user }) {
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPlato, setNewPlato] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    disponible: true, // Por defecto, un plato es disponible
    ingredientes: '', // Nuevo campo: cadena para ingredientes (separados por comas)
    estilos_alimentarios: '', // Nuevo campo: cadena para estilos (separados por comas)
  });

  const fetchPlatos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/productos'); // Ruta de backend para platos
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPlatos(data);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar platos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlato((prevPlato) => ({
      ...prevPlato,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir strings de ingredientes y estilos a arrays antes de enviar
      const platoToSend = {
        ...newPlato,
        ingredientes: newPlato.ingredientes.split(',').map(item => item.trim()).filter(item => item !== ''),
        estilos_alimentarios: newPlato.estilos_alimentarios.split(',').map(item => item.trim()).filter(item => item !== ''),
      };

      const response = await fetch('http://localhost:3000/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(platoToSend), // Enviar el objeto transformado
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewPlato({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        disponible: true,
        ingredientes: '',
        estilos_alimentarios: '',
      });
      fetchPlatos(); // Recargar la lista de platos
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar plato:', err);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        Cargando platos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="content-container">
      <h1>{user && user.rol === 'administrador' ? 'Gestionar Platos del Menú' : 'Menú del Restaurante'}</h1>

      {user && user.rol === 'administrador' && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nombre">Nombre del Plato:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={newPlato.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="descripcion">Descripción:</label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={newPlato.descripcion}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="precio">Precio:</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={newPlato.precio}
              onChange={handleChange}
              required
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="categoria">Categoría:</label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              value={newPlato.categoria}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="checkbox"
              id="disponible"
              name="disponible"
              checked={newPlato.disponible}
              onChange={handleChange}
            />
            <label htmlFor="disponible" style={{ display: 'inline-block', marginLeft: '10px' }}>Disponible</label>
          </div>
          <div>
            <label htmlFor="ingredientes">Ingredientes (separados por comas):</label>
            <input
              type="text"
              id="ingredientes"
              name="ingredientes"
              value={newPlato.ingredientes}
              onChange={handleChange}
              placeholder="ej: tomate, queso, albahaca"
            />
          </div>
          <div>
            <label htmlFor="estilos_alimentarios">Estilos Alimentarios (separados por comas):</label>
            <input
              type="text"
              id="estilos_alimentarios"
              name="estilos_alimentarios"
              value={newPlato.estilos_alimentarios}
              onChange={handleChange}
              placeholder="ej: vegetariano, picante"
            />
          </div>
          <button type="submit">Añadir Plato</button>
        </form>
      )}

      {user && user.rol === 'administrador' && (
        <hr style={{ width: '80%', margin: '20px 0' }} />
      )}

      <h1>Lista de Platos</h1>
      {platos.length > 0 ? (
        <div className="platos-grid-container">
          {platos.map((plato) => (
            <div key={plato.id} className="plato-card">
              <strong>{plato.nombre}</strong> ({plato.categoria}) - ${plato.precio}
              <br />
              <span>{plato.descripcion}</span>
              <br />
              <span>Ingredientes: {plato.ingredientes && plato.ingredientes.length > 0 ? plato.ingredientes.join(', ') : 'N/A'}</span>
              <br />
              <span>Estilos: {plato.estilos_alimentarios && plato.estilos_alimentarios.length > 0 ? plato.estilos_alimentarios.join(', ') : 'N/A'}</span>
              <br />
              <span>Estado: {plato.disponible ? 'Disponible' : 'No Disponible'}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay platos registrados.</p>
      )}
    </div>
  );
}

export default Platos; 