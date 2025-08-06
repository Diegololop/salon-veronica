import { supabase } from './supabase';

// Función asíncrona para resetear órdenes
export async function resetServiceOrders() {
  try {
    // Primero reiniciamos la secuencia de números de orden
    await supabase.rpc('restart_order_sequence');

    // Luego eliminamos todas las órdenes
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
    
    console.log('Órdenes eliminadas exitosamente');
    return { success: true };
  } catch (error) {
    console.error('Error al resetear órdenes:', error);
    return { success: false, error };
  }
}

// Función global para usar desde la consola del navegador
(window as any).resetOrders = async function() {
  const result = await resetServiceOrders();
  if (result.success) {
    console.log('✅ Órdenes eliminadas exitosamente');
    console.log('🔄 Recarga la página para ver los cambios');
  } else {
    console.error('❌ Error al eliminar órdenes:', result.error);
  }
};