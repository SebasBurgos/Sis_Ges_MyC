import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importar axios

function Pedidos({ user }) {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPedido, setNewPedido] = useState({
    cliente_id: user ? user.id : '', // Asignar cliente_id del usuario logueado si existe
    platos_solicitados: [],
  });
  const [currentPlatoSelection, setCurrentPlatoSelection] = useState({
    plato_id: '',
    cantidad: 1,
    observaciones: '' // Añadir campo de observaciones
  });
  // Nuevos estados para filtros de búsqueda de historial (visibles solo para administradores/meseros)
  const [historialSearchCliente, setHistorialSearchCliente] = useState('');
  const [historialSearchPlato, setHistorialSearchPlato] = useState('');
  const [historialSearchFecha, setHistorialSearchFecha] = useState('');

  // Funciones para cargar datos del backend
  const fetchPedidos = async (filters = {}) => {
    try {
      const params = {};
      // Si el usuario es un cliente, filtrar por su propio ID
      if (user && user.rol === 'cliente') {
        params.cliente_id = user.id;
      } else if (filters.cliente_id) {
        params.cliente_id = filters.cliente_id;
      }
      if (filters.plato) params.plato = filters.plato;
      if (filters.fecha) params.fecha = filters.fecha;

      const response = await axios.get('http://localhost:3000/api/pedidos/historial', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el historial de pedidos:', error);
      throw new Error('Error al obtener el historial de pedidos.');
    }
  };

  const fetchClientes = async () => {
    // Solo cargar clientes si el usuario es administrador/mesero (para el selector de cliente)
    if (user && (user.rol === 'administrador' || user.rol === 'mesero')) {
      const response = await axios.get('http://localhost:3000/api/usuarios');
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Filtrar la lista para incluir solo usuarios con rol de 'cliente'
      return response.data.filter(client => client.rol === 'cliente');
    }
    return []; // No cargar clientes si es un cliente logueado
  };

  const fetchPlatos = async () => {
    const response = await axios.get('http://localhost:3000/api/productos');
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data.filter(plato => plato.disponible);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pedidosData, clientesData, platosData] = await Promise.all([
          fetchPedidos(), // Cargar pedidos filtrados o todos
          fetchClientes(), // Cargar clientes solo si es necesario
          fetchPlatos(),
        ]);
        setPedidos(pedidosData);
        setClientes(clientesData);
        setPlatos(platosData);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar datos iniciales para pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]); // Añadir user a las dependencias para recargar datos si el usuario cambia

  const handlePedidoChange = (e) => {
    const { name, value } = e.target;
    setNewPedido((prevPedido) => ({
      ...prevPedido,
      [name]: value,
    }));
  };

  const handlePlatoSelectionChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlatoSelection((prevSelection) => ({
      ...prevSelection,
      [name]: name === 'cantidad' ? parseInt(value) : value,
    }));
  };

  const addPlatoToPedido = () => {
    const { plato_id, cantidad, observaciones } = currentPlatoSelection;
    if (plato_id && cantidad > 0) {
      const selectedPlato = platos.find(p => p.id === parseInt(plato_id));
      if (selectedPlato) {
        setNewPedido((prevPedido) => ({
          ...prevPedido,
          platos_solicitados: [...prevPedido.platos_solicitados, {
            plato_id: parseInt(plato_id),
            cantidad,
            nombre: selectedPlato.nombre,
            precio_unitario: selectedPlato.precio,
            observaciones, // Añadir observaciones aquí
          }],
        }));
        setCurrentPlatoSelection({ plato_id: '', cantidad: 1, observaciones: '' }); // Limpiar campo de observaciones
      }
    }
  };

  const removePlatoFromPedido = (index) => {
    setNewPedido((prevPedido) => ({
      ...prevPedido,
      platos_solicitados: prevPedido.platos_solicitados.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPedido.platos_solicitados.length === 0) {
      alert('Debe añadir al menos un plato al pedido.');
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];

    try {
      const response = await axios.post('http://localhost:3000/api/pedidos', { 
        ...newPedido,
        cliente_id: user.id, // Asegurar que el pedido se asocie al cliente logueado
        fecha: currentDate,
      });
      if (response.status !== 201) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewPedido({ cliente_id: user.id, platos_solicitados: [] }); // Resetear con el cliente actual
      setCurrentPlatoSelection({ plato_id: '', cantidad: 1, observaciones: '' });
      fetchPedidos().then(setPedidos);
      alert('Pedido registrado con éxito!');
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar pedido:', err);
      alert('Error al registrar pedido.' + err.message);
    }
  };

  // No necesitamos getClienteNombre si siempre mostramos el historial del cliente logueado
  // o si el campo de cliente no es visible para el cliente.
  const getClienteNombre = (cliente_id) => {
    if (user && user.rol === 'cliente') {
      return user.nombre; // Siempre mostrar el nombre del cliente logueado
    }
    const cliente = clientes.find(c => c.id === cliente_id);
    return cliente ? cliente.nombre : 'Desconocido';
  };

  const handleHistorialSearch = async () => {
    setLoading(true);
    try {
      const filteredPedidos = await fetchPedidos({
        cliente_id: (user && user.rol === 'cliente') ? user.id : historialSearchCliente || undefined,
        plato: historialSearchPlato || undefined,
        fecha: historialSearchFecha || undefined,
      });
      setPedidos(filteredPedidos);
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar historial de pedidos:', err);
      alert('Error al buscar historial de pedidos.' + err.message);
    } finally {
      setLoading(false);
    }
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
      <h1>Registrar Nuevo Pedido</h1>
      <form onSubmit={handleSubmit}>
        {/* Campo de selección de cliente solo visible para administradores/meseros */}
        {user && (user.rol === 'administrador' || user.rol === 'mesero') && (
          <div>
            <label htmlFor="cliente_id">Cliente:</label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={newPedido.cliente_id}
              onChange={handlePedidoChange}
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

        <h3>Añadir Platos al Pedido</h3>
        <div className="add-plato-controls">
          <div className="plato-cantidad-group">
            <div>
              <label htmlFor="plato_id">Plato:</label>
              <select
                id="plato_id"
                name="plato_id"
                value={currentPlatoSelection.plato_id}
                onChange={handlePlatoSelectionChange}
                className="styled-select"
              >
                <option value="">Seleccione un plato</option>
                {platos.map((plato) => (
                  <option key={plato.id} value={plato.id}>
                    {plato.nombre} (${plato.precio})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cantidad">Cantidad:</label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                value={currentPlatoSelection.cantidad}
                onChange={handlePlatoSelectionChange}
                min="1"
                required
              />
            </div>
          </div>
          <div className="plato-observaciones-actions">
            <label htmlFor="observaciones">Observaciones (opcional):</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={currentPlatoSelection.observaciones}
              onChange={handlePlatoSelectionChange}
            ></textarea>
            <button type="button" onClick={addPlatoToPedido} className="add-plato-button">
              Añadir Plato al Pedido
            </button>
          </div>
        </div>

        <h4>Platos en el Pedido Actual:</h4>
        {newPedido.platos_solicitados.length === 0 ? (
          <p>No hay platos añadidos al pedido.</p>
        ) : (
          <ul>
            {newPedido.platos_solicitados.map((item, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.nombre} (x{item.cantidad}) - Observaciones: {item.observaciones || 'N/A'}</span>
                <button type="button" onClick={() => removePlatoFromPedido(index)} className="delete-button">Eliminar</button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit">Registrar Pedido</button>
      </form>

      <hr />

      <h1>Historial Detallado de Pedidos</h1>
      {/* Ocultar los campos de búsqueda de historial si el usuario es un cliente */}
      {user && (user.rol === 'administrador' || user.rol === 'mesero') && (
        <div className="search-controls">
          <input
            type="text"
            placeholder="Buscar por ID de Cliente..."
            value={historialSearchCliente}
            onChange={(e) => setHistorialSearchCliente(e.target.value)}
          />
          <input
            type="text"
            placeholder="Buscar por nombre de Plato..."
            value={historialSearchPlato}
            onChange={(e) => setHistorialSearchPlato(e.target.value)}
          />
          <input
            type="date"
            placeholder="Buscar por Fecha..."
            value={historialSearchFecha}
            onChange={(e) => setHistorialSearchFecha(e.target.value)}
          />
          <button onClick={handleHistorialSearch}>Buscar Historial</button>
        </div>
      )}

      {pedidos.length === 0 ? (
        <p>No hay historial de pedidos disponible o no coincide con los filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="content-container table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Platos Solicitados</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{getClienteNombre(pedido.cliente_id)}</td>
                  <td>{pedido.fecha}</td>
                  <td>${typeof pedido.total === 'number' ? pedido.total.toFixed(2) : pedido.total}</td>
                  <td>
                    <ul>
                      {Array.isArray(pedido.platos_solicitados) && pedido.platos_solicitados.length > 0 ? (
                        pedido.platos_solicitados.map((plato, idx) => (
                          <li key={idx}>
                            {plato.nombre} (x{plato.cantidad}) - ${typeof plato.precio_unitario === 'number' ? plato.precio_unitario.toFixed(2) : 'N/A'}
                            {plato.observaciones && <p>Obs: {plato.observaciones}</p>}
                          </li>
                        ))
                      ) : (
                        <li>N/A</li>
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Pedidos; 