export interface ServiceOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_rut: string;
  equipment_type: string;
  equipment_brand: string;
  equipment_model: string;
  imei?: string;
  equipment_condition: string;
  work_description: string;
  technical_work: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delivered' | 'quoted';
  technician_id?: string;
  receptionist_id: string;
  quote: number;
  advance_payment: number;
  total_amount: number;
  notes?: string;
  password_type?: 'pin' | 'pattern' | 'password' | null;
  device_password?: string;
  created_at: string;
  updated_at?: string;
  delivered_at: string | null; // Fecha y hora de entrega
  warranty_days: number | null; // Días de garantía
  approved_at?: string | null; // <-- AÑADE ESTA LÍNEA
  rejected_at?: string | null; // <-- AÑADE ESTA LÍNEA
}

export interface ServiceOrderFormData {
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
  technicianId?: string;
  quote: number;
  advancePayment: number;
}