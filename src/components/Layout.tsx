import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';
import { CustomerDashboard } from './dashboard/CustomerDashboard';
import { Dashboard } from './dashboard/Dashboard'; // <- IMPORTA EL NUEVO COMPONENTE
import type { User } from '../types/auth';

export function Layout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-red-600">Error al cargar el perfil</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100">
      {/* --- LÓGICA DE RENDERIZADO ACTUALIZADA --- */}
      {(user.role === 'admin' || user.role === 'technician' || user.role === 'receptionist') && <Dashboard />}
      
      {/* El dashboard del cliente se mantiene separado */}
      {user.role === 'customer' && <CustomerDashboard />}
    </div>
  );
}