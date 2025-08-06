export interface Appointment {
  id: string;
  date: string;
  time: string;
  description: string;
  equipmentType: string;
  brand: string;
  model: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  customerId: string;
}