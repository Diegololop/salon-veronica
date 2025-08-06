import { supabase } from './supabase';

export async function createTestUsers() {
  try {
    // Crear administrador
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signUp({
      email: 'admin@servtec.cl',
      password: 'admin1234'
    });

    if (adminAuthError) throw adminAuthError;

    if (adminAuthData.user) {
      const { error: adminProfileError } = await supabase
        .from('profiles')
        .insert({
          id: adminAuthData.user.id,
          email: 'admin@servtec.cl',
          full_name: 'Administrador Principal',
          rut: '11111111-1',
          phone: '+56912345678',
          role: 'admin'
        });

      if (adminProfileError) throw adminProfileError;
    }

    // Crear técnico
    const { data: techAuthData, error: techAuthError } = await supabase.auth.signUp({
      email: 'tecnico@servtec.cl',
      password: 'tecnico1234'
    });

    if (techAuthError) throw techAuthError;

    if (techAuthData.user) {
      const { error: techProfileError } = await supabase
        .from('profiles')
        .insert({
          id: techAuthData.user.id,
          email: 'tecnico@servtec.cl',
          full_name: 'Juan Pérez',
          rut: '22222222-2',
          phone: '+56923456789',
          role: 'technician'
        });

      if (techProfileError) throw techProfileError;
    }

    // Crear recepcionista
    const { data: recepAuthData, error: recepAuthError } = await supabase.auth.signUp({
      email: 'recepcion@servtec.cl',
      password: 'recepcion1234'
    });

    if (recepAuthError) throw recepAuthError;

    if (recepAuthData.user) {
      const { error: recepProfileError } = await supabase
        .from('profiles')
        .insert({
          id: recepAuthData.user.id,
          email: 'recepcion@servtec.cl',
          full_name: 'María González',
          rut: '33333333-3',
          phone: '+56934567890',
          role: 'receptionist'
        });

      if (recepProfileError) throw recepProfileError;
    }

    return {
      success: true,
      users: [
        {
          role: 'admin',
          email: 'admin@servtec.cl',
          password: 'admin1234'
        },
        {
          role: 'technician',
          email: 'tecnico@servtec.cl',
          password: 'tecnico1234'
        },
        {
          role: 'receptionist',
          email: 'recepcion@servtec.cl',
          password: 'recepcion1234'
        }
      ]
    };

  } catch (error) {
    console.error('Error creating test users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}