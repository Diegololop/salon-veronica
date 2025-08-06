import React, { useEffect, useState } from 'react';
import { getOrders } from '../lib/api'; // Función para obtener las órdenes de servicio
import { ServiceOrder } from '../types/orders'; // Tipo definido para las órdenes de servicio
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { FaEye } from 'react-icons/fa'; // Ícono de ojo

const ServiceReports: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('');

  // Estados para el PIN y el Total Ganado
  const [pin, setPin] = useState<string>('');
  const [showTotalEarnings, setShowTotalEarnings] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string>('');

  // Estados para el pop-up
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalOrders, setModalOrders] = useState<ServiceOrder[]>([]);
  const [modalTitle, setModalTitle] = useState<string>('');

  // Obtener las órdenes de servicio al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOrders(); // Obtener las órdenes de servicio desde Supabase
        setServiceOrders(data);
        setFilteredOrders(data); // Inicialmente, mostrar todas las órdenes
      } catch (error) {
        console.error('Error fetching service orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const translateStatus = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'in_progress':
      return 'En Progreso';
    case 'completed':
      return 'Completada';
    case 'delivered':
      return 'Entregada'; // Nueva traducción
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
};

  


  // Calcular el tiempo promedio de resolución por tipo de servicio
  const calculateAverageResolutionTime = (type: string) => {
    const filteredOrders = serviceOrders.filter(order => order.equipment_type === type && order.status === 'completed');
    if (filteredOrders.length === 0) return 0;

    const totalTime = filteredOrders.reduce((sum, order) => {
      const createdAt = new Date(order.created_at).getTime();
      const updatedAt = new Date(order.updated_at || order.created_at).getTime(); // Usar created_at si updated_at no está disponible
      return sum + (updatedAt - createdAt);
    }, 0);

    return totalTime / filteredOrders.length / (1000 * 60 * 60 * 24); // Convertir a días
  };

   // Calcular la frecuencia de cada tipo de servicio
   const serviceTypeFrequency = serviceOrders.reduce((acc, order) => {
    acc[order.equipment_type] = (acc[order.equipment_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Datos para el gráfico de líneas (tiempo promedio de resolución)
  const resolutionTimeData = Object.keys(serviceTypeFrequency).map((type) => ({
    type,
    time: calculateAverageResolutionTime(type),
  }));

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    let filtered = serviceOrders;

    // Filtrar por rango de fechas
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at).getTime();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return orderDate >= start && orderDate <= end;
      });
    }

    // Filtrar por tipo de servicio
    if (serviceType) {
      filtered = filtered.filter(order => order.equipment_type === serviceType);
    }

    // Filtrar por estado de la orden
    if (orderStatus) {
      filtered = filtered.filter(order => order.status === orderStatus);
    }

    setFilteredOrders(filtered);
  }, [startDate, endDate, serviceType, orderStatus, serviceOrders]);

  // Datos calculados
const totalOrders = filteredOrders.length; // Total de órdenes filtradas
const completedOrders = filteredOrders.filter(order => 
  order.status === 'completed' || order.status === 'delivered'
).length;

const deliveredOrders = filteredOrders.filter(order => 
  order.status === 'delivered'
).length;

const pendingOrders = filteredOrders.filter(order => 
  order.status === 'pending' || order.status === 'in_progress'
).length;

// Calcular el Total Ganado (incluyendo órdenes 'completed' y 'delivered')
const totalEarnings = filteredOrders
  .filter(order => order.status === 'completed' || order.status === 'delivered')
  .reduce((sum, order) => sum + (order.total_amount || 0), 0);


  const validatePin = () => {
  if (pin === import.meta.env.VITE_PIN) { // ✅ Mejor que hardcodear
    setShowTotalEarnings(true);
    setPinError("");
  } else {
    setPinError("PIN incorrecto");
  }
};

  // Formatear el precio en CLP
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  // Ocultar el precio
  const hidePrice = () => {
    setShowTotalEarnings(false);
    setPin(''); // Limpiar el campo del PIN
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Datos para el gráfico de barras (frecuencia de tipos de servicio)
  const serviceTypeData = Object.entries(serviceTypeFrequency).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / totalOrders) * 100).toFixed(2),
  }));

  // Abrir el modal con las órdenes
  const openModal = (orders: ServiceOrder[], title: string) => {
    setModalOrders(orders);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reportes de Órdenes de Servicio</h1>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Rango de fechas</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Filtro por tipo de servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de servicio</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
              <option value="other">Otros</option>
            </select>
          </div>

          {/* Filtro por estado de la orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado de la orden</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completada</option>
              <option value="delivered">Entregada</option> {/* Nueva opción */} 
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apartado de Total Ganado */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Total Ganado</h2>
        {!showTotalEarnings ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Ingrese el PIN para ver el total ganado</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder="PIN"
              />
              <button
                onClick={validatePin}
                className="mt-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Validar
              </button>
            </div>
            {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600">Total Ganado</p>
            <p className="text-2xl font-bold">{formatPrice(totalEarnings)}</p>
            <button
              onClick={hidePrice}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Ocultar Precio
            </button>
          </div>
        )}
      </div>

      {/* Resumen de Órdenes de Servicio */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Resumen de Órdenes de Servicio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bloque: Total de órdenes */}
          <div className="bg-blue-50 p-4 rounded-lg relative">
            <p className="text-gray-600">Total de órdenes</p>
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
            <button
              onClick={() => openModal(filteredOrders, 'Todas las órdenes')}
              className="absolute top-2 right-2 text-gray-600 hover:text-blue-600"
            >
              <FaEye />
            </button>
          </div>

          {/* Bloque: Órdenes completadas */}
          <div className="bg-green-50 p-4 rounded-lg relative">
            <p className="text-gray-600">Órdenes completadas</p>
            <p className="text-2xl font-bold">{completedOrders}</p>
            <button
              onClick={() => openModal(
                filteredOrders.filter(order => order.status === 'completed'),
                'Órdenes completadas'
              )}
              className="absolute top-2 right-2 text-gray-600 hover:text-green-600"
            >
              <FaEye />
            </button>
          </div>

          {/* Bloque: Órdenes pendientes */}
          <div className="bg-yellow-50 p-4 rounded-lg relative">
            <p className="text-gray-600">Órdenes pendientes</p>
            <p className="text-2xl font-bold">{pendingOrders}</p>
            <button
              onClick={() => openModal(
                filteredOrders.filter(order => order.status === 'pending' || order.status === 'in_progress'),
                'Órdenes pendientes'
              )}
              className="absolute top-2 right-2 text-gray-600 hover:text-yellow-600"
            >
              <FaEye />
            </button>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg relative">
            <p className="text-gray-600">Órdenes entregadas</p>
            <p className="text-2xl font-bold">{deliveredOrders}</p>
            <button
              onClick={() => openModal(
                filteredOrders.filter(order => order.status === 'delivered'),
                'Órdenes entregadas'
              )}
              className="absolute top-2 right-2 text-gray-600 hover:text-purple-600"
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>

      {/* Modal para mostrar las órdenes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto z-50">
            <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
              {modalOrders.map(order => (
                <div key={order.id} className="border p-4 rounded-lg shadow-sm">
                  <p className="text-lg font-bold text-blue-600">Orden #: {order.order_number}</p>
                  <p><strong>Cliente:</strong> {order.customer_name}</p>
                  <p><strong>Estado:</strong> 
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending' || order.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {translateStatus(order.status)} {/* Traducir el estado */}
                    </span>
                  </p>
                  <p><strong>Monto:</strong> {formatPrice(order.total_amount || 0)}</p>
                </div>
              ))}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Gráfico de barras: Frecuencia de tipos de servicio */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Frecuencia de Tipos de Servicio</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={serviceTypeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Frecuencia" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de líneas: Tiempo promedio de resolución */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tiempo Promedio de Resolución (días)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={resolutionTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="time" stroke="#82ca9d" name="Tiempo (días)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ServiceReports;