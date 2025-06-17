import React, { useState, useEffect } from 'react';

function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevaMesa, setNuevaMesa] = useState({
    capacidad: '',
    ubicacion: '',
  });

  const fetchMesas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mesas'); // Asumiendo que tendrás esta ruta para mesas
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMesas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaMesa((prevMesa) => ({
      ...prevMesa,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/mesas', { // Ruta POST para crear mesas
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaMesa),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNuevaMesa({ capacidad: '', ubicacion: '' }); // Limpiar formulario
      fetchMesas(); // Recargar mesas
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar mesa:', err);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        Cargando mesas...
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
      <h1>Registrar Nueva Mesa</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="capacidad">Capacidad:</label>
          <input
            type="number"
            id="capacidad"
            name="capacidad"
            value={nuevaMesa.capacidad}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="ubicacion">Ubicación:</label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={nuevaMesa.ubicacion}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Registrar Mesa</button>
      </form>

      <hr style={{ width: '80%', margin: '20px 0' }} />

      <h1>Lista de Mesas</h1>
      {mesas.length > 0 ? (
        <ul>
          {mesas.map((mesa) => (
            <li key={mesa.id}>
              Mesa {mesa.id}: Capacidad {mesa.capacidad} - {mesa.ubicacion}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay mesas registradas.</p>
      )}
    </div>
  );
}

export default Mesas; 