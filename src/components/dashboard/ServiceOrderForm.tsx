import { useState, useEffect } from 'react';
import { X, Smartphone, Laptop, FileText, Phone, MapPin, DollarSign, PenTool as Tool, Wrench, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PatternLock } from '../PatternLock';
import type { User } from '../../types/auth';
import { notifyNewOrder } from '../../lib/notifications';
import type { ServiceOrder } from '../../types/orders';

interface ServiceOrderFormProps {
  onSubmit: (data: ServiceOrderData) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  initialData?: ServiceOrder | null;
}

export interface ServiceOrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerRut: string;
  equipmentType: string;
  brand: string;
  model: string;
  imei?: string;
  condition: string;
  description: string;
  technicalWork: string;
  quote: number;
  advancePayment: number;
  technicianId?: string;
  password_type?: 'pin' | 'pattern' | 'password' | null;
  device_password?: string;
}

export function ServiceOrderForm({ onSubmit, onClose, loading = false, initialData }: ServiceOrderFormProps) {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [formData, setFormData] = useState<ServiceOrderData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerRut: '',
    equipmentType: '',
    brand: '',
    model: '',
    imei: '',
    condition: '',
    description: '',
    technicalWork: '',
    quote: 0,
    advancePayment: 0,
    technicianId: '',
    password_type: null,
    device_password: ''
  });

  useEffect(() => {
    // Cargar técnicos desde Supabase
    const loadTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', 'technician');

        if (error) {
          console.error('Error loading technicians:', error);
          throw error;
        }

        const formattedTechnicians = data.map(tech => ({
          id: tech.id,
          fullName: tech.full_name,
          email: tech.email
        }));

        setTechnicians(formattedTechnicians);
      } catch (err) {
        console.error('Error loading technicians:', err);
      }
    };

    loadTechnicians();
  }, []);

  useEffect(() => {
    // Si hay datos iniciales, llenar el formulario
    if (initialData) {
      setFormData({
        customerName: initialData.customer_name,
        customerPhone: initialData.customer_phone,
        customerAddress: initialData.customer_address,
        customerRut: initialData.customer_rut,
        equipmentType: initialData.equipment_type,
        brand: initialData.equipment_brand,
        model: initialData.equipment_model,
        imei: initialData.imei || '',
        condition: initialData.equipment_condition,
        description: initialData.work_description,
        technicalWork: initialData.technical_work,
        quote: initialData.quote,
        advancePayment: initialData.advance_payment,
        technicianId: initialData.technician_id || '',
        password_type: initialData.password_type || null,
        device_password: initialData.device_password || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      
      // Esperar un momento para asegurar que la orden se creó
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obtener la última orden creada para este cliente
      const { data: latestOrder, error } = await supabase
        .from('service_orders')
        .select('order_number')
        .eq('customer_rut', formData.customerRut)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Notificar al cliente sobre la nueva orden
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Editar Orden de Servicio' : 'Nueva Orden de Servicio'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Cliente */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RUT
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    pattern="^[0-9]{7,8}-[0-9kK]$"
                    placeholder="12345678-9"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.customerRut}
                    onChange={(e) =>
                      setFormData({ ...formData, customerRut: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.customerAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, customerAddress: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información del Equipo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Equipo
                </label>
                <select
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.equipmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, equipmentType: e.target.value })
                  }
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="laptop">Laptop</option>
                  <option value="desktop">Computador de Escritorio</option>
                  <option value="tablet">Tablet</option>
                  <option value="others">Otros...</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMEI/Serie
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Técnico Asignado
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.technicianId}
                  onChange={(e) =>
                    setFormData({ ...formData, technicianId: e.target.value })
                  }
                >
                  <option value="">Sin asignar</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password_type || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_type: e.target.value as ServiceOrderData['password_type'],
                        device_password: '' // Reset password when type changes
                      })
                    }
                  >
                    <option value="">Sin contraseña</option>
                    <option value="pin">PIN</option>
                    <option value="pattern">Patrón</option>
                    <option value="password">Contraseña</option>
                  </select>
                </div>
              </div>

              {formData.password_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.password_type === 'pin' ? 'PIN' :
                     formData.password_type === 'pattern' ? 'Patrón' :
                     'Contraseña'} del Dispositivo
                  </label>
                  {formData.password_type === 'pattern' ? (
                    <div className="flex justify-center bg-gray-50 p-4 rounded-md">
                      <PatternLock
                        value={formData.device_password || ''}
                        onChange={(pattern) =>
                          setFormData({ ...formData, device_password: pattern })
                        }
                        size={200}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type={formData.password_type === 'pin' ? 'number' : 'text'}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.device_password}
                        onChange={(e) =>
                          setFormData({ ...formData, device_password: e.target.value })
                        }
                        placeholder={
                          formData.password_type === 'pin' ? 'Ej: 1234' :
                          'Ingrese la contraseña'
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Equipo
                </label>
                <div className="relative">
                  <Tool className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    required
                    rows={2}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    placeholder="Describa el estado físico del equipo, accesorios entregados, etc."
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Problema
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describa el problema reportado por el cliente"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajo a Realizar
                </label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    required
                    rows={3}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.technicalWork}
                    onChange={(e) =>
                      setFormData({ ...formData, technicalWork: e.target.value })
                    }
                    placeholder="Describa el trabajo técnico que se realizará en el equipo"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.quote}
                    onChange={(e) =>
                      setFormData({ ...formData, quote: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abono
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.advancePayment}
                    onChange={(e) =>
                      setFormData({ ...formData, advancePayment: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}