import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PatternLock } from './PatternLock';
import type { ServiceOrder } from '../types/orders';
import { BellRing, CheckCircle, XCircle } from 'lucide-react'; // Importa los íconos necesarios


export function ViewOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showWarrantyPopup, setShowWarrantyPopup] = useState(false);
  // --- 1. NUEVO ESTADO PARA EL HISTORIAL ---
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);

  useEffect(() => {
  const loadOrderAndHistory = async () => {
    try {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadOrderAndHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

function WarrantyPopup({ order, onClose }: { order: ServiceOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Detalles de Entrega - Orden #{order.order_number.toString().padStart(6, '0')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Fecha y Hora de Entrega</p>
              <p className="text-sm text-gray-900">
                {order.delivered_at ? new Date(order.delivered_at).toLocaleString('es-CL') : 'No registrada'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Días de Garantía</p>
              <p className="text-sm text-gray-900">
                {order.warranty_days ?? 'No registrados'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Orden no encontrada'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al Dashboard
        </button>
        <div className="flex gap-2">
        {order.status === 'delivered' && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Información de Entrega y Garantía</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de Entrega */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-700">Fecha de Entrega</p>
              <p className="text-sm text-gray-900 mt-1">
                {order.delivered_at ? new Date(order.delivered_at).toLocaleString('es-CL') : 'No registrada'}
              </p>
            </div>

            {/* Días de Garantía */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-700">Días de Garantía</p>
              <p className="text-sm text-gray-900 mt-1">
                {order.warranty_days ?? 'No registrados'}
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {notificationHistory.length > 0 && (
        <div className="mt-6 mb-6 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BellRing size={20} /> Historial de Decisiones
            </h2>
            <div className="space-y-3">
                {notificationHistory.map(notification => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 bg-white rounded-md">
                        <div>
                            {notification.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}  
        {order.status === 'delivered' && showWarrantyPopup && (
          <WarrantyPopup order={order} onClose={() => setShowWarrantyPopup(false)} />
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Orden de Servicio #{order.order_number.toString().padStart(6, '0')}
              </h1>
              <p className="text-gray-600">
                Creada el: {new Date(order.created_at).toLocaleString('es-CL')}
              </p>
              {/* Mensaje de Aprobación */}
                        {order.approved_at && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                                <CheckCircle size={16} />
                                <span>
                                    Presupuesto Aprobado el: {new Date(order.approved_at).toLocaleString('es-CL')}
                                </span>
                            </div>
                        )}

                        {/* --- AÑADE ESTE BLOQUE PARA EL MENSAJE DE RECHAZO --- */}
                        {order.rejected_at && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-red-700">
                                <XCircle size={16} />
                                <span>
                                    Presupuesto Rechazado el: {new Date(order.rejected_at).toLocaleString('es-CL')}
                                </span>
                            </div>
                        )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'}`}>
              {order.status === 'completed' ? 'Completado' :
              order.status === 'in_progress' ? 'En Progreso' :
              order.status === 'cancelled' ? 'Cancelado' :
              order.status === 'delivered' ? 'Entregado' :
              'Pendiente'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Información del Cliente</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nombre</p>
                    <p className="text-sm text-gray-900">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">RUT</p>
                    <p className="text-sm text-gray-900">{order.customer_rut}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Teléfono</p>
                    <p className="text-sm text-gray-900">{order.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dirección</p>
                    <p className="text-sm text-gray-900">{order.customer_address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Información del Equipo</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tipo</p>
                    <p className="text-sm text-gray-900">{order.equipment_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Marca</p>
                    <p className="text-sm text-gray-900">{order.equipment_brand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Modelo</p>
                    <p className="text-sm text-gray-900">{order.equipment_model}</p>
                  </div>
                  {order.imei && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">IMEI/Serie</p>
                      <p className="text-sm text-gray-900">{order.imei}</p>
                    </div>
                  )}
                  {order.password_type && order.device_password && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {order.password_type === 'pin' ? 'PIN' :
                         order.password_type === 'pattern' ? 'Patrón' :
                         'Contraseña'}
                      </p>
                      {order.password_type === 'pattern' ? (
                        <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                          <PatternLock
                            value={order.device_password}
                            onChange={() => {}} // Read-only mode
                            size={200}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">{order.device_password}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del Servicio */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Estado del Equipo</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {order.equipment_condition}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Descripción del Problema</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {order.work_description}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Trabajo a Realizar</h2>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {order.technical_work}
                </p>
              </div>

              {order.notes && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Notas</h2>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2">Información de Pago</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-sm text-gray-900">
                      ${(order.total_amount ?? 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Abono</p>
                    <p className="text-sm text-gray-900">
                      ${(order.advance_payment ?? 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Saldo</p>
                    <p className="text-sm text-gray-900">
                      ${((order.total_amount ?? 0) - (order.advance_payment ?? 0)).toLocaleString('es-CL')}

                      
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}