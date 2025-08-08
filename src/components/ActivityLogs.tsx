import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ActivityLog {
  id: number;
  user_id: string; // Asegúrate de que este campo esté incluido
  user_name: string;
  user_email: string;
  action_type: string;
  product_id: string;
  brand: string;
  model: string;
  quantity_affected: number;
  cost_price_affected: number;
  component_type_id: number;
  service_order: string; // Nuevo campo
  created_at: string;
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
  
      // Obtener los logs con user_id y service_order
      const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (logsError) throw logsError;
  
      // Obtener los usuarios de profiles
      const userIds = logsData.map(log => log.user_id);
  
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
  
      if (usersError) throw usersError;
  
      // Mapear logs con usuarios
      const userMap = Object.fromEntries(usersData.map(user => [user.id, user.full_name]));
  
      const formattedData = logsData.map(log => ({
        ...log,
        user_name: userMap[log.user_id] || 'Desconocido',
      }));
  
      setLogs(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-3 py-7 bg-gray-100 min-h-screen rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Registro de Actividades</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Usuario</th>
            <th className="px-4 py-2 border">Acción</th>
            <th className="px-4 py-2 border">Marca</th>
            <th className="px-4 py-2 border">Modelo</th>
            <th className="px-4 py-2 border">Cantidad</th>
            <th className="px-4 py-2 border">Precio</th>
            <th className="px-4 py-2 border">Orden de Servicio</th> {/* Nueva columna */}
            <th className="px-4 py-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-2 border">{log.user_name}</td>
              <td className="px-4 py-2 border">{log.action_type}</td>
              <td className="px-4 py-2 border">{log.brand}</td>
              <td className="px-4 py-2 border">{log.model}</td>
              <td className="px-4 py-2 border">{log.quantity_affected}</td>
              <td className="px-4 py-2 border">${log.cost_price_affected}</td>
              <td className="px-4 py-2 border">{log.service_order || 'N/A'}</td> {/* Mostrar el número de orden */}
              <td className="px-4 py-2 border">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
