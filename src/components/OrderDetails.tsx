import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ServiceOrderForm } from './dashboard/ServiceOrderForm';
import type { ServiceOrder, ServiceOrderData } from '../types/orders';

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

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

  const handleSave = async (data: ServiceOrderData) => {
    if (!id) return;
    
    try {
      setSaving(true);
      setError(null);

      const updates = {
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress,
        customer_rut: data.customerRut,
        equipment_type: data.equipmentType,
        equipment_brand: data.brand,
        equipment_model: data.model,
        imei: data.imei,
        equipment_condition: data.condition,
        work_description: data.description,
        technical_work: data.technicalWork,
        quote: data.quote,
        advance_payment: data.advancePayment,
        total_amount: data.quote,
        password_type: data.password_type,
        device_password: data.device_password,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      await loadOrder();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    navigate(`/print-select/${id}`);
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
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (showEditForm) {
    return (
      <ServiceOrderForm
        initialData={order}
        onSubmit={handleSave}
        onClose={() => navigate('/dashboard')}
        loading={saving}
      />
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
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-5 w-5" />
            Imprimir
          </button>
        </div>

        {/* Display order details if not editing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Order details content */}
        </div>
      </div>
    </div>
  );
}