import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Asegúrate que la ruta a tu cliente supabase sea correcta
import { CheckCircle, XCircle, AlertTriangle, Clock, Loader2, ServerCrash } from 'lucide-react';

// Define un tipo para la orden para mayor seguridad con TypeScript
type ServiceOrder = {
  id: string;
  order_number: number;
  status: string;
  technical_work: string;
  total_amount: number;
  [key: string]: any;
};

export function DecisionPage() {
  const { orden_id } = useParams<{ orden_id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usamos useCallback para la función de carga de datos
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!orden_id) {
      setError("No se proporcionó un ID de orden en la URL.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', orden_id)
        .single();
      
      // Error de base de datos o conexión
      if (dbError) {
        throw new Error("Ocurrió un error al consultar la orden.");
      }

      // **LA CLAVE DEL ARREGLO ESTÁ AQUÍ**
      // Si no hay datos (data es null), la orden no existe.
      if (!data) {
        throw new Error("La orden que buscas no existe o el enlace no es válido.");
      }
      
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orden_id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (isSubmitting || !order) return;
    setIsSubmitting(true);

    try {
      const { error: functionError } = await supabase.functions.invoke('update-quote-status', {
        body: { orderId: order.id, decision },
      });

      if (functionError) {
        throw new Error(`Error al procesar la decisión. Por favor, intenta de nuevo.`);
      }
      
      navigate(decision === 'approved' ? '/gracias/aprobado' : '/gracias/rechazado');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // --- Renderizado Condicional Robusto ---

  // 1. Muestra el loader mientras se busca la orden
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700">Buscando orden...</p>
        </div>
      </main>
    );
  }

  // 2. Muestra un error si algo falló en el proceso
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <ServerCrash className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold mt-4 text-gray-800">Ocurrió un Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  // 3. Muestra un mensaje si la decisión ya fue tomada
  if (order?.status !== 'quoted') {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <Clock className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="text-2xl font-bold mt-4 text-gray-800">Decisión ya Registrada</h1>
          <p className="mt-2 text-gray-600">
            Ya se ha procesado una decisión para la orden #{String(order?.order_number).padStart(6, '0')}.
          </p>
          <p className="mt-1 text-gray-600">Estado actual: <span className="font-semibold">{order?.status}</span>.</p>
        </div>
      </main>
    );
  }

  // 4. Si todo está bien, muestra el formulario de decisión
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Decisión del Presupuesto</h1>
          <p className="mt-2 text-gray-600">Orden de Servicio #{String(order.order_number).padStart(6, '0')}</p>
        </div>

        <div className="mt-6 border-t border-b border-gray-200 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Detalles del Servicio:</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{order.technical_work}</p>
          
          <div className="mt-4 text-2xl font-bold text-right text-gray-900">
            Total: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(order.total_amount)}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-center text-gray-500">
            <AlertTriangle className="inline-block h-4 w-4 mr-1 mb-0.5" />
            Al tomar una decisión, el estado de su orden se actualizará permanentemente.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => handleDecision('rejected')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin"/> : <><XCircle size={20} /> Rechazar</>}
            </button>
            <button 
              onClick={() => handleDecision('approved')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin"/> : <><CheckCircle size={20} /> Aprobar y Continuar</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}