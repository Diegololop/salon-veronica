import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../lib/auth';
import { AppointmentForm } from './AppointmentForm';
import { Calendar, Clock, FileText, PenTool as Tool, DollarSign, Wrench, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ServiceOrder } from '../../types/orders';
import type { Appointment } from '../../types/appointments';

export function CustomerDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar órdenes del cliente
        const { data: ordersData, error: ordersError } = await supabase
          .from('service_orders')
          .select('*')
          .eq('customer_rut', user.rut)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);

        // Cargar citas del cliente
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', user.id)
          .order('appointment_date', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);

      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleAppointmentSubmit = async (appointmentData: {
    date: string;
    time: string;
    description: string;
    equipmentType: string;
    brand: string;
    model: string;
  }) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          customer_id: user.id,
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          description: appointmentData.description,
          equipment_type: appointmentData.equipmentType,
          brand: appointmentData.brand,
          model: appointmentData.model,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => [...prev, data]);
      setSuccess('Hora reservada exitosamente');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600">No autorizado</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mi Panel</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {showForm ? 'Cancelar' : 'Reservar Hora'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Nueva Reserva</h3>
            <AppointmentForm
              onSubmit={handleAppointmentSubmit}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Órdenes de Servicio */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Mis Órdenes de Servicio</h3>
        {orders.length === 0 ? (
          <p className="text-gray-600">No tienes órdenes de servicio activas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">
                      Orden #{order.order_number.toString().padStart(6, '0')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('es-CL')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {order.status === 'completed' ? 'Completado' :
                     order.status === 'in_progress' ? 'En Progreso' :
                     order.status === 'cancelled' ? 'Cancelado' :
                     'Pendiente'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Tool className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Equipo</p>
                      <p className="text-sm text-gray-600">
                        {order.equipment_brand} {order.equipment_model}
                      </p>
                      {order.imei && (
                        <p className="text-sm text-gray-500">
                          IMEI/Serie: {order.imei}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClipboardList className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Estado del Equipo</p>
                      <p className="text-sm text-gray-600">{order.equipment_condition}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Descripción del Problema</p>
                      <p className="text-sm text-gray-600">{order.work_description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Trabajo a Realizar</p>
                      <p className="text-sm text-gray-600">{order.technical_work}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                      <p className="text-sm text-gray-600">
                        ${order.total_amount.toLocaleString()}
                      </p>
                      {order.advance_payment > 0 && (
                        <p className="text-sm text-gray-500">
                          Abono: ${order.advance_payment.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Reservas */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Mis Reservas</h3>
        {appointments.length === 0 ? (
          <p className="text-gray-600">No tienes reservas programadas.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problema
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(appointment.date).toLocaleDateString('es-CL')}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.equipmentType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.brand} {appointment.model}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {appointment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'}`}>
                          {appointment.status === 'completed' ? 'Completada' :
                           appointment.status === 'cancelled' ? 'Cancelada' :
                           'Programada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}