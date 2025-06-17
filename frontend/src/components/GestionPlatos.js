import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionPlatos = () => {
  const [platos, setPlatos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precio, setPrecio] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [ingredientes, setIngredientes] = useState('');
  const [estilosAlimentarios, setEstilosAlimentarios] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentPlatoId, setCurrentPlatoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategoria, setSearchCategoria] = useState('');
  const [searchDisponible, setSearchDisponible] = useState('');

  useEffect(() => {
    fetchPlatos();
  }, []);

  const fetchPlatos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      setPlatos(response.data);
    } catch (error) {
      console.error('Error al obtener platos:', error);
      alert('Error al obtener platos.');
    }
  };

  const handleSearch = async () => {
    try {
      const params = {};
      if (searchTerm) params.nombre = searchTerm;
      if (searchCategoria) params.categoria = searchCategoria;
      if (searchDisponible !== '') params.disponible = searchDisponible;

      const response = await axios.get('http://localhost:3000/api/productos', { params });
      setPlatos(response.data);
    } catch (error) {
      console.error('Error al buscar platos:', error);
      alert('Error al buscar platos.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const platoData = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      disponible,
      ingredientes: ingredientes.split(',').map(item => item.trim()),
      estilos_alimentarios: estilosAlimentarios.split(',').map(item => item.trim()),
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/productos/${currentPlatoId}`, platoData);
        alert('Plato actualizado con éxito!');
      } else {
        await axios.post('http://localhost:3000/api/productos', platoData);
        alert('Plato añadido con éxito!');
      }
      resetForm();
      fetchPlatos();
    } catch (error) {
      console.error('Error al guardar plato:', error);
      alert('Error al guardar plato.');
    }
  };

  const handleEdit = (plato) => {
    setNombre(plato.nombre);
    setCategoria(plato.categoria);
    setPrecio(plato.precio.toString());
    setDisponible(plato.disponible);
    setIngredientes(plato.ingredientes.join(', '));
    setEstilosAlimentarios(plato.estilos_alimentarios.join(', '));
    setEditMode(true);
    setCurrentPlatoId(plato.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for editing
  };

  const handleMarkUnavailable = async (id) => {
    if (window.confirm('¿Estás seguro de marcar este plato como no disponible?')) {
      try {
        await axios.put(`http://localhost:3000/api/productos/${id}/unavailable`);
        alert('Plato marcado como no disponible.');
        fetchPlatos();
      } catch (error) {
        console.error('Error al marcar plato como no disponible:', error);
        alert('Error al marcar plato como no disponible.');
      }
    }
  };

  const resetForm = () => {
    setNombre('');
    setCategoria('');
    setPrecio('');
    setDisponible(true);
    setIngredientes('');
    setEstilosAlimentarios('');
    setEditMode(false);
    setCurrentPlatoId(null);
  };

  return (
    <div className="content-container">
      <h1>Gestión de Platos</h1>

      <form onSubmit={handleSubmit}>
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
          <label htmlFor="categoria">Categoría:</label>
          <input
            type="text"
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="disponible">Disponible:</label>
          <input
            type="checkbox"
            id="disponible"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
          />
        </div>
        <div>
          <label htmlFor="ingredientes">Ingredientes (separados por coma):</label>
          <textarea
            id="ingredientes"
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="estilosAlimentarios">Estilos Alimentarios (separados por coma):</label>
          <textarea
            id="estilosAlimentarios"
            value={estilosAlimentarios}
            onChange={(e) => setEstilosAlimentarios(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">{editMode ? 'Actualizar Plato' : 'Añadir Plato'}</button>
        {editMode && <button type="button" onClick={resetForm}>Cancelar Edición</button>}
      </form>

      <hr />

      <h2>Buscar Platos</h2>
      <div className="search-controls">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por categoría..."
          value={searchCategoria}
          onChange={(e) => setSearchCategoria(e.target.value)}
        />
        <select
          value={searchDisponible}
          onChange={(e) => setSearchDisponible(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="true">Disponible</option>
          <option value="false">No Disponible</option>
        </select>
        <button onClick={handleSearch}>Buscar</button>
      </div>

      <hr />

      <h2>Lista de Platos</h2>
      {platos.length === 0 ? (
        <p>No hay platos registrados.</p>
      ) : (
        <div className="platos-grid-container">
          {platos.map((plato) => (
            <div key={plato.id} className="plato-card">
              <h3>{plato.nombre}</h3>
              <p>Categoría: {plato.categoria}</p>
              <p>Precio: ${typeof plato.precio === 'number' ? plato.precio.toFixed(2) : plato.precio}</p>
              <p>Disponible: {plato.disponible ? 'Sí' : 'No'}</p>
              <p>Ingredientes: {Array.isArray(plato.ingredientes) && plato.ingredientes.length > 0 ? plato.ingredientes.join(', ') : 'N/A'}</p>
              <p>Estilos: {Array.isArray(plato.estilos_alimentarios) && plato.estilos_alimentarios.length > 0 ? plato.estilos_alimentarios.join(', ') : 'N/A'}</p>
              <div className="plato-card-actions">
                <button onClick={() => handleEdit(plato)}>Editar</button>
                <button onClick={() => handleMarkUnavailable(plato.id)}>Marcar No Disponible</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionPlatos; 