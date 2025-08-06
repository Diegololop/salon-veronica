import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ServiceOrder } from '../types/orders';
import logo from '../public/logo.png';

export function TechnicalPrintOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [printed, setPrinted] = useState(false); // Estado para evitar doble impresión

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('service_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  useEffect(() => {
    // This function will be called after the print dialog is closed
    const handleAfterPrint = () => {
      window.close(); // Closes the current tab
    };

    window.addEventListener('afterprint', handleAfterPrint);

    if (order && !printed) {
      setPrinted(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
        }, 100); // Small delay to ensure content is rendered
      });
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [order, printed]);

  if (loading || !order) {
    return <div className="p-4">Cargando para imprimir...</div>; // Show a message
  }


  return (
    <div className="technical-print-order">
      {/* Logo */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <img 
            src={logo}
            alt="ServTec Logo"
            className="h-16 w-auto"
          />
        </div>
      </div>

      <div className="text-center border-b border-black pb-3 mb-4">
      <div className="text-lg font-bold mb-1">
        ORDEN TÉCNICA #{order.order_number.toString().padStart(6, '0')}
      </div>
      <div className="text-xs">
        Fecha: {new Date(order.created_at).toLocaleString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </div>
    </div>

      {/* Información del Equipo */}
      <div className="border-b border-black pb-3 mb-4">
        <div className="font-bold text-sm mb-2">EQUIPO</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="font-semibold">Tipo:</span>
            <span className="ml-1">{order.equipment_type}</span>
          </div>
          <div>
            <span className="font-semibold">Marca:</span>
            <span className="ml-1">{order.equipment_brand}</span>
          </div>
          <div>
            <span className="font-semibold">Modelo:</span>
            <span className="ml-1">{order.equipment_model}</span>
          </div>
          {order.imei && (
            <div>
              <span className="font-semibold">IMEI/Serie:</span>
              <span className="ml-1">{order.imei}</span>
            </div>
          )}
          {order.password_type && order.device_password && (
            <div className="col-span-2">
              <span className="font-semibold">
                {order.password_type === 'pin' ? 'PIN' :
                 order.password_type === 'pattern' ? 'Patrón' :
                 'Contraseña'}:
              </span>
              <span className="ml-1">{order.device_password}</span>
            </div>
          )}
        </div>
      </div>

      

      {/* Estado y Descripción */}
      <div className="space-y-4 mb-4">
        <div>
          <div className="font-bold text-sm mb-1">ESTADO DEL EQUIPO</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
            {order.equipment_condition}
          </div>
        </div>

        <div>
          <div className="font-bold text-sm mb-1">PROBLEMA REPORTADO</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
            {order.work_description}
          </div>
        </div>

        <div>
          <div className="font-bold text-sm mb-1">TRABAJO A REALIZAR</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
            {order.technical_work}
          </div>
        </div>

        {order.notes && (
          <div>
            <div className="font-bold text-sm mb-1">NOTAS TÉCNICAS</div>
            <div className="text-xs whitespace-pre-wrap border p-2 rounded">
              {order.notes}
            </div>
          </div>
        )}
      </div>
      {/* MONTOS */}
      <div>
          <div className="font-bold text-sm mb-1">PRESUPUESTO</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
            ${order.quote}
          </div>
        </div>

        <div>
          <div className="font-bold text-sm mb-1">ABONO</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
            ${order.advance_payment}
          </div>
        </div>

      <div>
          <div className="font-bold text-sm mb-1">MONTO TOTAL</div>
          <div className="text-xs whitespace-pre-wrap border p-2 rounded">
          ${(order.total_amount - order.advance_payment).toLocaleString()}
          </div>
        </div>

      {/* Espacio para notas adicionales */}
      <div className="border-t border-black pt-2 mb-4">
        <div className="font-bold text-sm mb-2">NOTAS ADICIONALES:</div>
        <div className="border-b border-dotted border-gray-400 h-20"></div>
      </div>

      {/* Firma */}
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md text-center">
          <div className="border-t border-black pt-2">
            <div className="text-xs font-semibold">Técnico Asignado</div>
          </div>
        </div>
      </div>
    </div>
  );
}