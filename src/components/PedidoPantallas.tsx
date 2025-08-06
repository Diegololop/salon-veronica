import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

interface PedidoPantalla {
  id: string;
  modelo: string;
  fecha_compra: string;
  precio_costo: number;
  cantidad: number;
  proveedor: string;
  numero_orden: string;
  created_at?: string;
}

export function PedidoPantallas() {
  const [pedidos, setPedidos] = useState<PedidoPantalla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelo, setModelo] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [precioCosto, setPrecioCosto] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number | null>(null);
  const [proveedor, setProveedor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [numeroOrden, setNumeroOrden] = useState('');

  useEffect(() => {
    const fetchUserAndPedidos = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser && ['technician', 'admin', 'receptionist'].includes(currentUser.role)) {
            loadPedidos();
        } else {
            setLoading(false);
        }
    };
    fetchUserAndPedidos();
  }, []);

  const proveedores = [
    { id: 1, nombre: 'FullMobile' },
    { id: 2, nombre: 'Stark Comunicaciones' },
  ];

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos_pantallas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data as PedidoPantalla[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPedido = async () => {
    if (!modelo || !fechaCompra || !precioCosto || precioCosto <= 0 || !cantidad || cantidad <= 0 || !proveedor || !numeroOrden) {
      setError('Todos los campos son obligatorios y deben ser válidos.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pedidos_pantallas')
        .insert([{ 
          modelo, 
          fecha_compra: fechaCompra, 
          precio_costo: precioCosto, 
          cantidad, 
          proveedor, 
          numero_orden: numeroOrden
        }])
        .select();

      if (error) throw error;

      setPedidos([data[0] as PedidoPantalla, ...pedidos]);
      setModelo('');
      setFechaCompra('');
      setPrecioCosto(null);
      setCantidad(null);
      setProveedor('');
      setNumeroOrden('');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredPedidos = pedidos.filter((pedido) =>
    pedido.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }
  
  if (!user || !['technician', 'admin', 'receptionist'].includes(user.role)) {
    return <div className="p-4 text-red-600">Acceso no autorizado.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-theme(space.24))]">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold mb-6">Pedido de Pantallas</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Agregar Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input type="text" placeholder="Ej: Samsung Galaxy S21" className="w-full p-2 border rounded-md" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Orden</label>
              <input type="text" placeholder="Ej: ORD123456" className="w-full p-2 border rounded-md" value={numeroOrden} onChange={(e) => setNumeroOrden(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
              <input type="datetime-local" className="w-full p-2 border rounded-md" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Costo</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                <input type="number" placeholder="Ej: 150000" className="w-full pl-8 p-2 border rounded-md" value={precioCosto ?? ""} onChange={(e) => setPrecioCosto(e.target.value ? Number(e.target.value) : null)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" placeholder="Ej: 10" className="w-full p-2 border rounded-md" value={cantidad ?? ""} onChange={(e) => setCantidad(e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select className="w-full p-2 border rounded-md bg-white" value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.nombre}>{prov.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleAddPedido} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto">
            Agregar Pedido
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Modelo</label>
          <input type="text" placeholder="Escribe un modelo para filtrar..." className="w-full p-2 border rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-grow flex flex-col">
        {filteredPedidos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Número de Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Fecha de Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Precio de Costo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Proveedor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{pedido.numero_orden}</td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{pedido.modelo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(pedido.fecha_compra).toLocaleString('es-CL')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${pedido.precio_costo.toLocaleString('es-CL')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pedido.cantidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pedido.proveedor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center h-full text-gray-500 py-10">
            No se encontraron pedidos con ese modelo.
          </div>
        )}
      </div>
    </div>
  );
}