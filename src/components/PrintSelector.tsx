import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ServiceOrder } from '../types/orders';

export function PrintSelector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
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

    loadOrder();
  }, [id]);

  const handlePrintClient = () => {
    window.open(`/print/${id}?type=client&copies=1`, '_blank');
  };

  const handlePrintTechnical = () => {
    window.open(`/print-technical/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Orden no encontrada'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold">
            Orden #{order.order_number.toString().padStart(6, '0')}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Seleccionar tipo de impresión</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orden del Cliente */}
            <div className="flex flex-col p-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-lg font-semibold mb-2">Orden del Cliente</div>
                <p className="text-sm text-gray-600 text-center">
                  Versión completa con información del cliente, términos y condiciones.
                  Ideal para entregar al cliente.
                </p>
              </div>
              <button
                onClick={handlePrintClient}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Imprimir Orden Cliente
              </button>
            </div>

            {/* Orden Técnica */}
            <div className="flex flex-col p-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-lg font-semibold mb-2">Orden Técnica</div>
                <p className="text-sm text-gray-600 text-center">
                  Versión simplificada con detalles técnicos y espacio para notas.
                  Ideal para el trabajo interno.
                </p>
              </div>
              <button
                onClick={handlePrintTechnical}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Imprimir Orden Técnica
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Printer className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 mb-1">
                  Información de impresión
                </div>
                <p className="text-sm text-blue-700">
                  Se abrirá una nueva ventana con la orden seleccionada lista para imprimir.
                  La impresión comenzará automáticamente y la ventana se cerrará al finalizar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}