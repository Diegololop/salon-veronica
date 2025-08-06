import { supabase } from './supabase';

// Función para probar la conexión
export async function testConnection() {
  console.log('Probando conexión a Supabase...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error de conexión:', error);
      return false;
    }

    console.log('Conexión exitosa!');
    console.log('Datos recibidos:', data);
    return true;
  } catch (err) {
    console.error('Error inesperado:', err);
    return false;
  }
}

// Ejecutar la prueba
testConnection();