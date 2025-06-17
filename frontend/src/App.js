import React, { useState, useEffect } from 'react';
import './App.css';
import Mesas from './components/Mesas';
import Usuarios from './components/Usuarios'; // Importar el componente Usuarios
import Reservas from './components/Reservas'; // Importar el nuevo componente Reservas
import Platos from './components/Platos'; // Importar el nuevo componente Platos
import Pedidos from './components/Pedidos'; // Importar el nuevo componente Pedidos
import Resenas from './components/Resenas'; // Importar el nuevo componente Resenas
import Preferencias from './components/Preferencias'; // Importar el nuevo componente Preferencias
import GestionPlatos from './components/GestionPlatos'; // Importar el nuevo componente GestionPlatos
import Login from './components/Login'; // Importar el componente Login
import Register from './components/Register'; // Importar el nuevo componente Register
import ClientDashboard from './components/ClientDashboard'; // Importar el nuevo componente ClientDashboard
import MeseroDashboard from './components/MeseroDashboard'; // Importar el nuevo componente MeseroDashboard

function App() {
  const [currentView, setCurrentView] = useState('platos'); // Vista por defecto si no hay usuario
  const [user, setUser] = useState(null); // Estado para el usuario logueado
  const [authForm, setAuthForm] = useState('login'); // Estado para controlar si mostrar login o register

  // Cargar el usuario de localStorage al inicio
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Decidir la vista inicial basada en el rol del usuario
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.rol === 'cliente') {
        setCurrentView('clientDashboard');
      } else if (parsedUser.rol === 'administrador') {
        setCurrentView('clientes'); // O cualquier vista por defecto para administradores
      } else if (parsedUser.rol === 'mesero') { // Añadir lógica para mesero
        setCurrentView('meseroDashboard');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    // Redirigir a una vista por defecto después del login exitoso basado en el rol
    if (loggedInUser.rol === 'cliente') {
      setCurrentView('clientDashboard');
    } else if (loggedInUser.rol === 'administrador') {
      setCurrentView('clientes');
    } else if (loggedInUser.rol === 'mesero') { // Añadir lógica para mesero
      setCurrentView('meseroDashboard');
    }
  };

  const handleRegisterSuccess = () => {
    // Después de un registro exitoso, redirigir al usuario a la pantalla de login
    setAuthForm('login');
    alert('Registro exitoso. Por favor, inicia sesión.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('platos'); // Volver a la vista de platos (pública) o login
    setAuthForm('login'); // Asegurarse de volver al formulario de login
  };

  return (
    <div className="App">
      <header className="App-header">
        {!user ? (
          authForm === 'login' ? (
            <Login onLoginSuccess={handleLoginSuccess} onGoToRegister={() => setAuthForm('register')} />
          ) : (
            <Register onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setAuthForm('login')} />
          )
        ) : (
          user.rol === 'cliente' ? (
            <ClientDashboard user={user} handleLogout={handleLogout} />
          ) : user.rol === 'mesero' ? ( // Renderizar MeseroDashboard si es mesero
            <MeseroDashboard user={user} handleLogout={handleLogout} />
          ) : (
            <>
              <nav>
                {user.rol === 'administrador' && (
                  <button onClick={() => setCurrentView('clientes')}>Gestionar Clientes</button>
                )}
                {user.rol === 'administrador' && (
                  <button onClick={() => setCurrentView('mesas')}>Gestionar Mesas</button>
                )}
                {user.rol === 'mesero' && (
                  <button onClick={() => setCurrentView('reservas')}>Gestionar Reservas</button>
                )}
                <button onClick={() => setCurrentView('platos')}>Ver Menú (Clientes)</button>
                {user.rol === 'administrador' && (
                  <button onClick={() => setCurrentView('adminPlatos')}>Administrar Platos</button>
                )}
                {user.rol === 'mesero' && (
                  <button onClick={() => setCurrentView('pedidos')}>Gestionar Pedidos</button>
                )}
                {(user.rol === 'administrador' || user.rol === 'cliente') && (
                  <button onClick={() => setCurrentView('resenas')}>Gestionar Reseñas</button>
                )}
                {user.rol === 'cliente' && (
                  <button onClick={() => setCurrentView('preferencias')}>Gestionar Preferencias</button>
                )}
                <button onClick={handleLogout}>Cerrar Sesión</button>
              </nav>

              {currentView === 'clientes' && <Usuarios user={user} />}
              {currentView === 'mesas' && <Mesas />}
              {currentView === 'reservas' && <Reservas />} 
              {currentView === 'platos' && <Platos />} 
              {currentView === 'adminPlatos' && <GestionPlatos />} 
              {currentView === 'pedidos' && <Pedidos />} 
              {currentView === 'resenas' && <Resenas user={user} />} 
              {currentView === 'preferencias' && <Preferencias user={user} />} 
            </>
          )
        )}
      </header>
    </div>
  );
}

export default App;
