import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importar axios para manejar las peticiones HTTP

function Resenas({ user }) {
  // console.log("USER EN RESENAS:", user);
  const [resenas, setResenas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newResena, setNewResena] = useState({
    cliente_id: user ? user.id : '', // Asignar cliente_id del usuario logueado si existe
    plato_id: '',
    valoracion: 5, 
    comentario: '',
  });

  const [filterValoracion, setFilterValoracion] = useState('');
  const [filterClienteNombre, setFilterClienteNombre] = useState('');
  const [filterPlatoNombre, setFilterPlatoNombre] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  const fetchResenas = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (user && user.rol === 'cliente') {
      queryParams.append('cliente_id', user.id);
    }
    if (filters.cliente_nombre) {
      queryParams.append('cliente_nombre', filters.cliente_nombre);
    }
    if (filters.plato_nombre) {
      queryParams.append('plato_nombre', filters.plato_nombre);
    }
    if (filters.valoracion) {
      queryParams.append('calificacion', filters.valoracion);
    }
    if (filters.fecha) {
      queryParams.append('fecha', filters.fecha);
    }
    const url = `http://localhost:3000/api/resenas?${queryParams.toString()}`;
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error('Error al obtener las reseñas:', error);
      throw new Error('Error al obtener las reseñas.');
    }
  };

  const fetchClientes = async () => {
    // Solo cargar clientes si el usuario es administrador (para el selector de cliente)
    if (user && user.rol === 'administrador') {
      try {
        const response = await axios.get('http://localhost:3000/api/usuarios');
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.data;
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
        throw new Error('Error al obtener los clientes.');
      }
    }
    return []; // No cargar clientes si es un cliente logueado
  };

  const fetchPlatos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = response.data.filter(plato => plato.disponible);
      console.log("Platos cargados (con IDs):", data);
      return data;
    } catch (error) {
      console.error('Error al obtener los platos:', error);
      throw new Error('Error al obtener los platos.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resenasData, clientesData, platosData] = await Promise.all([
          fetchResenas({
            cliente_nombre: filterClienteNombre,
            plato_nombre: filterPlatoNombre,
            valoracion: filterValoracion,
            fecha: filterFecha,
          }),
          fetchClientes(),
          fetchPlatos(),
        ]);
        setResenas(resenasData);
        setClientes(clientesData);
        setPlatos(platosData);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar datos iniciales para reseñas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, filterClienteNombre, filterPlatoNombre, filterValoracion, filterFecha]);

  const handleResenaChange = (e) => {
    const { name, value } = e.target;
    setNewResena((prevResena) => ({
      ...prevResena,
      [name]: name === 'valoracion' ? parseInt(value) : value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'filterValoracion') {
      setFilterValoracion(value);
    } else if (name === 'filterClienteNombre') {
      setFilterClienteNombre(value);
    } else if (name === 'filterPlatoNombre') {
      setFilterPlatoNombre(value);
    } else if (name === 'filterFecha') {
      setFilterFecha(value);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchResenas({
      cliente_nombre: filterClienteNombre,
      plato_nombre: filterPlatoNombre,
      valoracion: filterValoracion,
      fecha: filterFecha,
    })
      .then(data => {
        setResenas(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        console.error('Error al aplicar filtros:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resenaData = { ...newResena };
      if (user && user.rol === 'cliente') {
        resenaData.cliente_id = user.id; // Asegurar que la reseña se asocie al cliente logueado
      }
      console.log("Datos de la reseña a enviar:", resenaData);

      const response = await axios.post('http://localhost:3000/api/resenas', resenaData);
      if (response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewResena({ cliente_id: user ? user.id : '', plato_id: '', valoracion: 5, comentario: '' }); // Resetear con el cliente actual
      fetchResenas({ valoracion: filterValoracion, plato_id: filterPlatoNombre }).then(setResenas);
      alert('Reseña registrada con éxito!');
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar reseña:', err);
      alert('Error al registrar reseña: ' + (err.response?.data?.message || err.message));
    }
  };

  const getClienteNombre = (cliente_id) => {
    if (user && user.rol === 'cliente') {
      return user.nombre; // Siempre mostrar el nombre del cliente logueado
    }
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nombre : 'Desconocido';
  };

  if (loading) {
    return (
      <div className="content-container">
        Cargando datos...
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
      {user && user.rol === 'cliente' && (
        <>
          <h1>Registrar Nueva Reseña</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="plato_id">Plato (opcional):</label>
              <select
                id="plato_id"
                name="plato_id"
                value={newResena.plato_id}
                onChange={handleResenaChange}
              >
                <option key="general-review" value="">General (reseña general)</option>
                {platos.map((plato) => (
                  <option key={plato.id} value={plato.id}>{plato.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="valoracion">Valoración:</label>
              <select
                id="valoracion"
                name="valoracion"
                value={newResena.valoracion}
                onChange={handleResenaChange}
              >
                {[5,4,3,2,1].map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="comentario">Comentario (opcional):</label>
              <textarea
                id="comentario"
                name="comentario"
                value={newResena.comentario}
                onChange={handleResenaChange}
              />
            </div>
            <button type="submit">Registrar Reseña</button>
          </form>
        </>
      )}

      <h1>Historial de Reseñas</h1>
      {/* Aquí puedes agregar controles de búsqueda/filtros si lo deseas, visibles para admin y mesero */}
      {/* Por ejemplo: */}
      {(user && (user.rol === 'administrador' || user.rol === 'mesero')) && (
        <form className="search-controls" onSubmit={handleFilterSubmit} style={{ background: '#2e3238', padding: 20, borderRadius: 10, marginBottom: 30 }}>
          <input
            type="text"
            name="filterClienteNombre"
            placeholder="Buscar por nombre de cliente..."
            value={filterClienteNombre}
            onChange={handleFilterChange}
            list="clientes-list"
            autoComplete="off"
          />
          <datalist id="clientes-list">
            {clientes && clientes.length > 0 ? clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.nombre} />
            )) : null}
          </datalist>
          <input
            type="text"
            name="filterPlatoNombre"
            placeholder="Buscar por nombre de plato..."
            value={filterPlatoNombre}
            onChange={handleFilterChange}
            list="platos-list"
            autoComplete="off"
          />
          <datalist id="platos-list">
            {platos && platos.length > 0 ? platos.map((plato) => (
              <option key={plato.id} value={plato.nombre} />
            )) : null}
          </datalist>
          <input
            type="date"
            name="filterFecha"
            placeholder="Buscar por Fecha..."
            value={filterFecha}
            onChange={handleFilterChange}
          />
          <select
            name="filterValoracion"
            value={filterValoracion}
            onChange={handleFilterChange}
          >
            <option key="all-valoraciones" value="">Todas las valoraciones</option>
            <option value="5">5 Estrellas</option>
            <option value="4">4 Estrellas</option>
            <option value="3">3 Estrellas</option>
            <option value="2">2 Estrellas</option>
            <option value="1">1 Estrella</option>
          </select>
          <button type="submit">Buscar</button>
        </form>
      )}

      {resenas.length === 0 ? (
        <p>No hay reseñas disponibles o no coinciden con los filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="content-container table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plato</th>
                <th>Valoración</th>
                <th>Comentario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {resenas.map((resena) => {
                return (
                  <tr key={resena.id}>
                    <td>{getClienteNombre(resena.cliente_id)}</td>
                    <td>
                      {(() => {
                        console.log("Resena plato_id:", resena.plato_id);
                        console.log("Platos cargados:", platos);
                        const platoEncontrado = platos.find(p => p.id === resena.plato_id);
                        return platoEncontrado ? platoEncontrado.nombre : 'General';
                      })()}
                    </td>
                    <td>{resena.valoracion} Estrellas</td>
                    <td>{resena.comentario || 'N/A'}</td>
                    <td>{new Date(resena.fecha).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Resenas;