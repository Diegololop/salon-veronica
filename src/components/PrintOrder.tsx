import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ServiceOrder } from '../types/orders';
import logo from '../public/logo.png';
import { businessInfo } from '../config/businessInfo'; // Import config

const BUSINESS_INFO = {
  name: 'ServTec',
  tagline: 'Servicio Técnico Profesional',
  address: 'Av. Centenario 286, Of. 4, 5 y 6, San Antonio',
  phone: '+56 9 3400 1830',
  website: 'www.servtec.cl',
  schedule: {
    weekdays: '09:30 - 19:00',
    saturday: '10:00 - 17:00',
    sunday: 'Cerrado'
  },
  rut: '77.494.886-4'
};

export function PrintOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [printed, setPrinted] = useState(false); // Estado para evitar múltiples impresiones

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

  const { contact, legal, online, operations, name, tagline } = businessInfo;


  return (
    <div className="print-order">
      <div className="text-center border-b border-black pb-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={logo} alt="ServTec Logo" className="h-20 w-auto" />
        </div>
        <div className="text-xs mb-2">{BUSINESS_INFO.tagline}</div>
        <div className="text-xs space-y-0.5">
          <div>{contact.address.simplified}</div>
          <div>RUT: {legal.rut}</div>
          <div>{contact.phone}</div>
          <div className="text-[10px]">
          Lunes a Viernes: {operations.schedule[0].hours} • Sábado: {operations.schedule[1].hours}
          </div>
        </div>
      </div>

      <div className="text-center border-b border-black pb-3 mb-4">
      <div className="text-lg font-bold mb-1">
        ORDEN DE SERVICIO #{order.order_number.toString().padStart(6, '0')}
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

      <div className="border-b border-black pb-3 mb-4">
        <div className="font-bold text-sm mb-2">CLIENTE</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="font-semibold">Nombre:</span>
            <span className="ml-1">{order.customer_name}</span>
          </div>
          <div>
            <span className="font-semibold">RUT:</span>
            <span className="ml-1">{order.customer_rut}</span>
          </div>
          <div>
            <span className="font-semibold">Teléfono:</span>
            <span className="ml-1">{order.customer_phone}</span>
          </div>
          <div>
            <span className="font-semibold">Dirección:</span>
            <span className="ml-1">
              {order.customer_address?.trim() || 'No Informada'}
            </span>
          </div>
        </div>
      </div>

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
        </div>
      </div>

      <div className="border-b border-black pb-3 mb-4">
        <div className="mb-3">
          <div className="font-bold text-sm mb-2">ESTADO DEL EQUIPO</div>
          <div className="text-xs whitespace-pre-wrap">
            {order.equipment_condition}
          </div>
        </div>

        <div className="mb-3">
          <div className="font-bold text-sm mb-2">DESCRIPCIÓN DEL PROBLEMA</div>
          <div className="text-xs whitespace-pre-wrap">
            {order.work_description}
          </div>
        </div>

        <div>
          <div className="font-bold text-sm mb-2">TRABAJO A REALIZAR</div>
          <div className="text-xs whitespace-pre-wrap">
            {order.technical_work}
          </div>
        </div>
      </div>

      <div className="border-b border-black pb-3 mb-4">
        <div className="font-bold text-sm mb-2">PRESUPUESTO</div>
        <div className="text-xs grid grid-cols-2 gap-1">
          <div className="font-semibold">Total:</div>
          <div className="text-right">${(order.total_amount ?? 0).toLocaleString('es-CL')}</div>
          {order.advance_payment > 0 && (
            <>
              <div className="font-semibold">Abono:</div>
              <div className="text-right">
                ${order.advance_payment.toLocaleString()}
              </div>
              <div className="font-semibold">Saldo:</div>
              <div className="text-right">
                ${(order.total_amount - order.advance_payment).toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Términos y Condiciones */}
      <div className="border-b border-black pb-3 mb-4">
      <div className="font-bold text-sm mb-2">TÉRMINOS Y CONDICIONES</div>
      <ol className="text-[10px] list-decimal pl-4 space-y-1">
          {businessInfo.print.terms.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Firmas */}
      <div className="flex justify-center mb-4">
      <div className="w-[45%]"><div>
      <br />
      <br />
      <br />
      </div>
      <div className=" mb-3 border-t border-black pt-3">
        <div className="text-xs font-semibold text-center">Acepto los términos y condiciones</div>
      </div>
      </div>
      </div>

      <div className="text-center text-[10px]">
        <div className="font-semibold mb-0.5">¡Gracias por su preferencia!</div>
          <div>{online.website}</div>
      </div>
    </div>
  );
}
