import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// Validación más estricta de las variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error en variables de entorno de Supabase:', {
    url: supabaseUrl ? 'definida' : 'falta',
    key: supabaseAnonKey ? 'definida' : 'falta'
  });
  throw new Error('Faltan variables de entorno requeridas para Supabase');
}

// Cliente de Supabase con mejor configuración
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Función para verificar la conexión
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    
    // Verificar sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error al verificar sesión:', sessionError);
      return false;
    }

    // Si hay sesión, verificar que podamos acceder a los datos
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al verificar perfil:', error);
        return false;
      }

      return true;
    }

    // Si no hay sesión, verificar que podamos al menos conectar
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error al verificar conexión:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al verificar conexión:', error);
    return false;
  }
}

// Función para inicializar la conexión
export async function initializeSupabase() {
  try {
    // Verificar conexión
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('No se pudo establecer conexión con Supabase');
    }

    // Configurar listener para cambios de sesión
    supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('currentUser');
        window.location.href = '/auth';
      } else if (event === 'SIGNED_IN' && session) {
        // Actualizar datos del usuario
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Error al cargar perfil:', error);
              return;
            }
            if (profile) {
              localStorage.setItem('currentUser', JSON.stringify({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name,
                rut: profile.rut,
                phone: profile.phone,
                role: profile.role,
                createdAt: profile.created_at
              }));
            }
          });
      }
    });

    return true;
  } catch (error) {
    console.error('Error al inicializar Supabase:', error);
    return false;
  }
}

