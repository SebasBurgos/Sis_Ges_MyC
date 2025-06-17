import React, { useState, useEffect } from 'react';

function Usuarios({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newClient, setNewClient] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    rol: 'cliente',
  });
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.rol === 'administrador') {
      fetchUsers();
    } else {
      setLoading(false);
      setError('Acceso denegado: No tienes permisos para ver esta sección.');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prevClient) => ({
      ...prevClient,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewClient({ nombre: '', correo: '', telefono: '', password: '', rol: 'cliente' });
      fetchUsers();
      alert('Usuario registrado con éxito!');
    } catch (err) {
      setError(err.message);
      console.error('Error al registrar usuario:', err);
      alert(`Error al registrar usuario: ${err.message}`);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (user && user.id === userId) {
      alert('No puedes cambiar tu propio rol.');
      setEditingRole(null);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rol: newRole }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchUsers();
      setEditingRole(null);
      alert(`Rol del usuario ${userId} actualizado a ${newRole} con éxito!`);
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar el rol:', err);
      alert(`Error al actualizar el rol: ${err.message}`);
    }
  };

  const handleViewHistory = async (clienteId, clienteNombre) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const pedidosResponse = await fetch(`http://localhost:3000/api/pedidos?cliente_id=${clienteId}`);
      if (!pedidosResponse.ok) {
        throw new Error(`HTTP error! status: ${pedidosResponse.status} al cargar pedidos`);
      }
      const pedidosData = await pedidosResponse.json();

      const reservasResponse = await fetch(`http://localhost:3000/api/reservas?cliente_id=${clienteId}`);
      if (!reservasResponse.ok) {
        throw new Error(`HTTP error! status: ${reservasResponse.status} al cargar reservas`);
      }
      const reservasData = await reservasResponse.json();

      setSelectedClientHistory({
        clienteId,
        clienteNombre,
        pedidos: pedidosData,
        reservas: reservasData,
      });
    } catch (err) {
      setHistoryError(err.message);
      console.error('Error al cargar historial del cliente:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        Cargando usuarios...
      </div>
    );
  }

  if (error && user.rol === 'administrador') {
    return (
      <div className="content-container">
        Error: {error}
      </div>
    );
  } else if (error && user.rol !== 'administrador') {
    return (
      <div className="content-container">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (user.rol !== 'administrador') {
    return (
      <div className="content-container">
        <p className="text-danger">No tienes permisos para acceder a la gestión de usuarios.</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <h1>Registrar Nuevo Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={newClient.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={newClient.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={newClient.telefono}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newClient.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="rol">Rol:</label>
          <select
            id="rol"
            name="rol"
            value={newClient.rol}
            onChange={handleChange}
            required
          >
            <option value="cliente">Cliente</option>
            <option value="mesero">Mesero</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button type="submit">Registrar Usuario</button>
      </form>

      <hr style={{ width: '80%', margin: '20px 0' }} />

      <h1>Lista de Usuarios</h1>
      {users.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((_user) => (
                <tr key={_user.id}>
                  <td>{_user.nombre}</td>
                  <td>{_user.correo}</td>
                  <td>{_user.telefono}</td>
                  <td>
                    {editingRole === _user.id ? (
                      <select
                        value={_user.rol}
                        onChange={(e) => handleUpdateRole(_user.id, e.target.value)}
                        disabled={user && user.id === _user.id}
                      >
                        <option value="cliente">Cliente</option>
                        <option value="mesero">Mesero</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    ) : (
                      <>{_user.rol}</>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewHistory(_user.id, _user.nombre)}
                      style={{ marginRight: '5px' }}
                    >
                      Ver Historial
                    </button>
                    {user && user.rol === 'administrador' && user.id !== _user.id && (
                      <button onClick={() => setEditingRole(_user.id)}>
                        {editingRole === _user.id ? 'Guardar' : 'Editar Rol'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}

      {selectedClientHistory && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#282c34',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          width: '80%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'white',
        }}>
          <h2>Historial Detallado de {selectedClientHistory.clienteNombre}</h2>
          {historyLoading && <p>Cargando historial...</p>}
          {historyError && <p style={{ color: 'red' }}>Error al cargar historial: {historyError}</p>}
          {!historyLoading && !historyError && (
            <>
              <h3>Pedidos:</h3>
              {selectedClientHistory.pedidos.length > 0 ? (
                <ul>
                  {selectedClientHistory.pedidos.map(pedido => (
                    <li key={pedido.id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #444', borderRadius: '4px' }}>
                      <strong>Pedido ID: {pedido.id}</strong> - Fecha: {new Date(pedido.fecha).toLocaleDateString()} - Total: ${typeof pedido.total === 'number' ? pedido.total.toFixed(2) : '0.00'}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay pedidos para este cliente.</p>
              )}
              <h3>Reservas:</h3>
              {selectedClientHistory.reservas.length > 0 ? (
                <ul>
                  {selectedClientHistory.reservas.map(reserva => (
                    <li key={reserva.id} style={{ marginBottom: '10px', padding: '8px', border: '1px solid #444', borderRadius: '4px' }}>
                      <strong>Reserva ID: {reserva.id}</strong> - Mesa: {reserva.mesa_id} - Fecha: {new Date(reserva.fecha).toLocaleDateString()} - Hora: {reserva.hora} - Estado: {reserva.estado}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay reservas para este cliente.</p>
              )}
              <button
                onClick={() => setSelectedClientHistory(null)}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#61dafb', color: '#282c34', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Cerrar Historial
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Usuarios; 