import React, { useState, useEffect } from 'react';

function Reservas({ user }) {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReserva, setNewReserva] = useState({
    cliente_id: user && user.rol === 'cliente' ? parseInt(user.id) : '',
    mesa_id: '',
    fecha: '',
    hora: '',
    numero_personas: '',
  });

  const fetchReservas = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `http://localhost:3000/api/reservas${queryParams ? `?${queryParams}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const fetchClientes = async () => {
    if (user && (user.rol === 'administrador' || user.rol === 'mesero')) {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json().then(data => data.filter(client => client.rol === 'cliente').map(client => ({ ...client, id: parseInt(client.id) })));
    }
    return [];
  };

  const fetchMesas = async () => {
    const response = await fetch('http://localhost:3000/api/mesas');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const fetchAvailableMesas = async (fecha, hora, numero_personas) => {
    if (!fecha || !hora || !numero_personas) return [];
    try {
      const response = await fetch(
        `http://localhost:3000/api/reservas/disponibilidad?fecha=${fecha}&hora=${hora}&numero_personas=${numero_personas}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error('Error al obtener mesas disponibles:', err);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const initialReservasFilters = user && user.rol === 'cliente' ? { cliente_id: user.id } : {};

        const [reservasData, clientesData, allMesasData] = await Promise.all([
          fetchReservas(initialReservasFilters),
          fetchClientes(),
          fetchMesas(),
        ]);
        setReservas(reservasData);
        setClientes(clientesData);

        if (user && (user.rol === 'administrador' || user.rol === 'mesero') && (!newReserva.fecha || !newReserva.hora || !newReserva.numero_personas)) {
          setMesas(allMesasData);
        } else if (newReserva.fecha && newReserva.hora && newReserva.numero_personas) {
          const available = await fetchAvailableMesas(newReserva.fecha, newReserva.hora, newReserva.numero_personas);
          setMesas(available);
        } else {
          setMesas(allMesasData);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error al cargar datos iniciales para reservas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    if (newReserva.fecha && newReserva.hora && newReserva.numero_personas) {
      fetchAvailableMesas(newReserva.fecha, newReserva.hora, newReserva.numero_personas)
        .then(setMesas)
        .catch(err => console.error('Error al actualizar mesas disponibles:', err));
    } else if (!newReserva.fecha || !newReserva.hora || !newReserva.numero_personas) {
      if (user && (user.rol === 'administrador' || user.rol === 'mesero')) {
        fetchMesas().then(setMesas);
      }
    }
  }, [newReserva.fecha, newReserva.hora, newReserva.numero_personas, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReserva((prevReserva) => ({
      ...prevReserva,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...newReserva, cliente_id: parseInt(newReserva.cliente_id) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      setNewReserva({ cliente_id: user && user.rol === 'cliente' ? parseInt(user.id) : '', mesa_id: '', fecha: '', hora: '', numero_personas: '' });
      fetchReservas(user && user.rol === 'cliente' ? { cliente_id: user.id } : {}).then(setReservas);
      alert('Reserva registrada con éxito!');
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar reserva:', err);
      alert(`Error al registrar reserva: ${err.message}`);
    }
  };

  const [filterFecha, setFilterFecha] = useState('');
  const [filterClienteId, setFilterClienteId] = useState('');

  const handleFilterSearch = async () => {
    const filters = {};
    if (filterFecha) filters.fecha = filterFecha;
    if (user && (user.rol === 'administrador' || user.rol === 'mesero') && filterClienteId) {
      filters.cliente_id = filterClienteId;
    } else if (user && user.rol === 'cliente') {
      filters.cliente_id = user.id;
    }
    fetchReservas(filters).then(setReservas).catch(err => {
      setError(err.message);
      console.error('Error al buscar reservas filtradas:', err);
      alert(`Error al buscar reservas: ${err.message}`);
    });
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
      <h1>Registrar Nueva Reserva</h1>
      <form onSubmit={handleSubmit}>
        {user && (user.rol === 'administrador' || user.rol === 'mesero') && (
          <div>
            <label htmlFor="cliente_id">Cliente:</label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={newReserva.cliente_id}
              onChange={handleChange}
              required
              className="styled-select"
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} ({cliente.correo})
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="numero_personas">Número de Personas:</label>
          <input
            type="number"
            id="numero_personas"
            name="numero_personas"
            value={newReserva.numero_personas}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="fecha">Fecha:</label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={newReserva.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="hora">Hora:</label>
          <input
            type="time"
            id="hora"
            name="hora"
            value={newReserva.hora}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="mesa_id">Mesa:</label>
          <select
            id="mesa_id"
            name="mesa_id"
            value={newReserva.mesa_id}
            onChange={handleChange}
            required
            className="styled-select"
          >
            <option value="">Seleccione una mesa</option>
            {mesas.map((mesa) => (
              <option key={mesa.id} value={mesa.id}>
                Mesa {mesa.id} (Capacidad: {mesa.capacidad}, Ubicación: {mesa.ubicacion})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Registrar Reserva</button>
      </form>

      <hr style={{ width: '80%', margin: '20px 0' }} />

      <h1>Lista de Reservas</h1>
      {user && (user.rol === 'administrador' || user.rol === 'mesero') && (
        <div className="filter-controls" style={{ marginBottom: '20px' }}>
          <label htmlFor="filterFecha">Filtrar por Fecha:</label>
          <input
            type="date"
            id="filterFecha"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor="filterClienteId">Filtrar por Cliente:</label>
          <select
            id="filterClienteId"
            value={filterClienteId}
            onChange={(e) => setFilterClienteId(e.target.value)}
            style={{ marginRight: '10px' }}
          >
            <option value="">Todos los clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} ({cliente.correo})
              </option>
            ))}
          </select>
          <button onClick={handleFilterSearch}>Buscar</button>
        </div>
      )}

      {reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <ul>
          {reservas.map((reserva) => {
            const cliente = clientes.find(c => c.id === parseInt(reserva.cliente_id));
            const mesa = mesas.find(m => m.id === reserva.mesa_id);
            const clienteNombre = cliente ? cliente.nombre : 'Desconocido';
            const mesaInfo = mesa ? `Mesa #${mesa.id}` : 'Mesa Desconocida';

            return (
              <li key={reserva.id}>
                <strong>Reserva ID: {reserva.id}</strong>
                <span>Cliente: {clienteNombre}</span>
                <span>Mesa: {mesaInfo}</span>
                <span>Ubicación: {mesa ? mesa.ubicacion : 'N/A'}</span>
                <span>Capacidad: {mesa ? mesa.capacidad : 'N/A'} personas</span>
                <span>Número de Personas: {reserva.numero_personas}</span>
                <span>Fecha: {new Date(reserva.fecha).toLocaleDateString()}</span>
                <span>Hora: {reserva.hora}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Reservas; 