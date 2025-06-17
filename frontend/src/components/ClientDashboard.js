import React, { useState } from 'react';
import Platos from './Platos';
import Pedidos from './Pedidos';
import Preferencias from './Preferencias';
import Resenas from './Resenas';
import Reservas from './Reservas';

function ClientDashboard({ user, handleLogout }) {
  const [currentClientView, setCurrentClientView] = useState('platos');

  return (
    <div className="client-dashboard">
      <nav>
        <button onClick={() => setCurrentClientView('platos')}>Ver Menú</button>
        <button onClick={() => setCurrentClientView('preferencias')}>Mis Preferencias</button>
        <button onClick={() => setCurrentClientView('pedidos')}>Mis Pedidos</button>
        <button onClick={() => setCurrentClientView('resenas')}>Mis Reseñas</button>
        <button onClick={() => setCurrentClientView('reservas')}>Hacer Reserva</button>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </nav>

      {
        currentClientView === 'platos' && <Platos user={user} />
      }
      {
        currentClientView === 'preferencias' && <Preferencias user={user} />
      }
      {
        currentClientView === 'pedidos' && <Pedidos user={user} />
      }
      {
        currentClientView === 'resenas' && <Resenas user={user} />
      }
      {
        currentClientView === 'reservas' && <Reservas user={user} />
      }
    </div>
  );
}

export default ClientDashboard; 