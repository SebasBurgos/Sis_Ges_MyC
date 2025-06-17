import React, { useState } from 'react';
import Mesas from './Mesas';
import Pedidos from './Pedidos';
import Platos from './Platos'; // Para que el mesero pueda ver el menú

function MeseroDashboard({ user, handleLogout }) {
  const [currentMeseroView, setCurrentMeseroView] = useState('pedidos'); // Vista por defecto para mesero

  return (
    <div className="mesero-dashboard-container">
      <nav>
        <button onClick={() => setCurrentMeseroView('pedidos')}>Gestionar Pedidos</button>
        <button onClick={() => setCurrentMeseroView('mesas')}>Gestionar Mesas</button>
        <button onClick={() => setCurrentMeseroView('platos')}>Ver Menú</button>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </nav>

      <div className="mesero-content">
        {currentMeseroView === 'pedidos' && <Pedidos user={user} />}
        {currentMeseroView === 'mesas' && <Mesas user={user} />}
        {currentMeseroView === 'platos' && <Platos user={user} />}
      </div>
    </div>
  );
}

export default MeseroDashboard; 