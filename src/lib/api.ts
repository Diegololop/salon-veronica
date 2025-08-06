import { supabase } from './supabase';
import type { ServiceOrder } from '../types/orders';
import type { Appointment } from '../types/appointments';

// Funciones para órdenes
export const getOrders = async (): Promise<ServiceOrder[]> => {
  let allOrders: ServiceOrder[] = [];
  const pageSize = 1000; // Tamaño de página (ajústalo según sea necesario)
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false }) // Ordenar por fecha descendente
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      if (data && data.length > 0) {
        allOrders = [...allOrders, ...data];
        offset += pageSize;
      } else {
        hasMore = false; // No hay más datos
      }
    }

    return allOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const createOrder = async (order: Partial<ServiceOrder>) => {
  const { data, error } = await supabase
    .from('service_orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOrder = async (id: string, updates: Partial<ServiceOrder>) => {
  const { data, error } = await supabase
    .from('service_orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Funciones para citas
export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createAppointment = async (appointment: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};