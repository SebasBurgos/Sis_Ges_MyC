import React, { useState, useEffect } from 'react';

function Preferencias({ user }) {
  const [preferencias, setPreferencias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [newPreferencia, setNewPreferencia] = useState({
    cliente_id: '',
    tipo: '',
    descripcion: '',
  });

  useEffect(() => {
    if (user && user.rol === 'cliente') {
      setNewPreferencia(prev => ({ ...prev, cliente_id: user.id }));
    }
  }, [user]);

  // Funciones para cargar datos del backend
  const fetchPreferencias = async () => {
    const response = await fetch('http://localhost:3000/api/preferencias');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  const fetchClientes = async () => {
    const response = await fetch('http://localhost:3000/api/usuarios');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  // Nueva función para cargar platos
  const fetchPlatos = async () => {
    const response = await fetch('http://localhost:3000/api/productos'); // Ajusta la ruta si es necesario
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Cargar preferencias, clientes y ahora también platos
        const [preferenciasData, clientesData, platosData] = await Promise.all([
          fetchPreferencias(),
          fetchClientes(),
          fetchPlatos(), // Cargar platos
        ]);
        setPreferencias(preferenciasData);
        setClientes(clientesData);
        setPlatos(platosData); // Guardar los platos en el estado
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar datos iniciales para preferencias:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePreferenciaChange = (e) => {
    const { name, value } = e.target;
    setNewPreferencia((prevPreferencia) => ({
      ...prevPreferencia,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log('handleSubmit llamado!');
    e.preventDefault();
    try {
      // Construir dataToSend basado en el formato esperado por el backend
      const dataToSend = {
        cliente_id: newPreferencia.cliente_id,
        intolerancias: [],
        estilos_preferidos: [],
      };

      if (newPreferencia.tipo.toLowerCase() === 'intolerancia') {
        dataToSend.intolerancias.push(newPreferencia.descripcion);
      } else if (newPreferencia.tipo.toLowerCase() === 'estilo_alimentario') {
        dataToSend.estilos_preferidos.push(newPreferencia.descripcion);
      } else {
        // Si el tipo no coincide, podrías manejarlo de otra forma o simplemente no añadirlo a las listas específicas
        console.warn('Tipo de preferencia desconocido:', newPreferencia.tipo);
      }

      console.log('Datos de newPreferencia a enviar:', dataToSend);
      const response = await fetch('http://localhost:3000/api/preferencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Asegúrate de enviar el token de autorización si es necesario para esta ruta
        },
        body: JSON.stringify(dataToSend),
      });
      console.log('Respuesta de la solicitud POST:', response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Actualizar la lista de preferencias después de un envío exitoso
      fetchPreferencias().then(data => setPreferencias(data));
      // Limpiar el formulario, pero mantener cliente_id si es un cliente logueado
      setNewPreferencia(prev => ({
        ...prev,
        tipo: '',
        descripcion: '',
        cliente_id: user && user.rol === 'cliente' ? user.id : '', // Mantener si es cliente, limpiar si es admin/mesero
      }));
      alert('Preferencia añadida con éxito!');
    } catch (err) {
      setError(err.message);
      console.error('Error al enviar la nueva preferencia:', err);
      alert(`Error al añadir preferencia: ${err.message}`);
    }
  };

  return (
    <div className="content-container">
      <h1>Gestión de Preferencias</h1>

      {loading && <p>Cargando preferencias...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      <div className="card">
        <div className="card-header">
          <h3>Añadir Nueva Preferencia</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {user && (user.rol === 'admin' || user.rol === 'mesero') && ( // Mostrar solo si es admin o mesero
              <div>
                <label htmlFor="cliente_id">Cliente:</label>
                <select
                  id="cliente_id"
                  name="cliente_id"
                  value={newPreferencia.cliente_id}
                  onChange={handlePreferenciaChange}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes
                    .filter(cliente => cliente.rol === 'cliente') // Filtrar por rol 'cliente'
                    .map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="tipo">Tipo:</label>
              <select
                id="tipo"
                name="tipo"
                value={newPreferencia.tipo}
                onChange={handlePreferenciaChange}
                required
              >
                <option value="">Seleccione un tipo</option>
                <option value="intolerancia">Intolerancia</option>
                <option value="estilo_alimentario">Estilo Alimentario</option>
              </select>
            </div>
            <div>
              <label htmlFor="descripcion">Descripción (ej: vegetariano, sin gluten, picante):</label>
              <input
                type="text"
                id="descripcion"
                name="descripcion"
                value={newPreferencia.descripcion}
                onChange={handlePreferenciaChange}
                required
              />
            </div>
            <button type="submit">Añadir Preferencia</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Preferencias Existentes</h3>
        </div>
        <div className="card-body">
          {preferencias.length === 0 ? (
            <p>No hay preferencias registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {(user && user.rol === 'cliente'
                    ? preferencias.filter(pref => parseInt(pref.cliente_id) === user.id)
                    : preferencias
                  ).map((pref) => {
                    const clienteAsociado = clientes.find(c => c.id === parseInt(pref.cliente_id));
                    const nombreCliente = clienteAsociado ? clienteAsociado.nombre : 'Desconocido';

                    let tipoTexto = '';
                    let descripcionTexto = '';

                    if (pref.intolerancias && pref.intolerancias.length > 0) {
                      tipoTexto = 'Intolerancia';
                      descripcionTexto = pref.intolerancias.join(', ');
                    } else if (pref.estilos_preferidos && pref.estilos_preferidos.length > 0) {
                      tipoTexto = 'Estilo Alimentario';
                      descripcionTexto = pref.estilos_preferidos.join(', ');
                    }

                    return (
                      <tr key={pref._id}>
                        <td>{nombreCliente}</td>
                        <td>{tipoTexto}</td>
                        <td>{descripcionTexto}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Sugerencias de Platos */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Sugerencias de Platos</h3>
        </div>
        <div className="card-body">
          {/* Lógica para generar y mostrar sugerencias */}
          {newPreferencia.cliente_id === '' ? (
            <p>Seleccione un cliente para ver sugerencias personalizadas.</p>
          ) : (
            (() => {
              const clientePreferencia = preferencias.find(pref => pref.cliente_id === newPreferencia.cliente_id);
              const intoleranciasCliente = clientePreferencia ? clientePreferencia.intolerancias.map(i => i.toLowerCase()) : [];

              const platosSugeridos = platos.filter(plato => {
                // Excluir platos que contengan intolerancias del cliente
                if (plato.ingredientes && plato.ingredientes.length > 0) {
                  const platoTieneIntolerancia = plato.ingredientes.some(ing =>
                    intoleranciasCliente.includes(ing.toLowerCase())
                  );
                  return !platoTieneIntolerancia; // Excluir si tiene intolerancia
                }
                return true; // Incluir si no tiene ingredientes o no hay intolerancias especificadas
              });

              // Filtrar por estilos alimentarios
              const estilosCliente = clientePreferencia ? clientePreferencia.estilos_preferidos.map(e => e.toLowerCase()) : [];
              const platosFiltradosPorEstilo = platosSugeridos.filter(plato => {
                if (estilosCliente.length > 0 && plato.estilos_alimentarios && plato.estilos_alimentarios.length > 0) {
                  // Si el cliente tiene estilos y el plato también, el plato debe coincidir con al menos uno de los estilos del cliente
                  return estilosCliente.some(estiloCliente =>
                    plato.estilos_alimentarios.map(es => es.toLowerCase()).includes(estiloCliente)
                  );
                }
                // Si el cliente no tiene estilos, o el plato no tiene estilos, o el cliente es vegano/vegetariano y el plato lo es, incluirlo
                return true;
              });

              return (
                <div>
                  {platosFiltradosPorEstilo.length === 0 ? (
                    <p>No hay sugerencias de platos para las preferencias seleccionadas.</p>
                  ) : (
                    <div className="platos-grid">
                      {platosFiltradosPorEstilo.map(plato => (
                        <div key={plato.id} className="plato-card">
                          <h3>{plato.nombre}</h3>
                          <p>Descripción: {plato.descripcion}</p>
                          <p>Precio: ${typeof plato.precio === 'number' ? plato.precio.toFixed(2) : 'N/A'}</p>
                          <p>Categoría: {plato.categoria}</p>
                          <p>Disponibilidad: {plato.disponible ? 'Sí' : 'No'}</p>
                          <p>Ingredientes: {plato.ingredientes && plato.ingredientes.length > 0 ? plato.ingredientes.join(', ') : 'N/A'}</p>
                          <p>Estilos: {plato.estilos_alimentarios && plato.estilos_alimentarios.length > 0 ? plato.estilos_alimentarios.join(', ') : 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

export default Preferencias;