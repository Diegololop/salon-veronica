import { supabase } from './supabase';
import type { User, UserRole } from '../types/auth';

// Register new user
export const register = async (
  email: string,
  password: string,
  fullName: string,
  rut: string,
  phone: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Registrar el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 2. Crear el perfil del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        rut,
        phone,
        role: 'customer' as UserRole
      });

    if (profileError) throw profileError;

    return { success: true, message: 'Registro exitoso' };
  } catch (error: any) {
    console.error('Error en registro:', error);
    return { 
      success: false, 
      message: error.message || 'Error en el registro' 
    };
  }
};

// Login user
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No se encontró el usuario');
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    // Guardar la información del usuario en localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      rut: profile.rut,
      phone: profile.phone,
      role: profile.role,
      createdAt: profile.created_at
    }));

    return { success: true, message: 'Inicio de sesión exitoso' };
  } catch (error: any) {
    console.error('Error en login:', error);
    return { 
      success: false, 
      message: error.message || 'Credenciales inválidas' 
    };
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Intentar limpiar la sesión de todas formas
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    // Intentar obtener usuario de localStorage
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    // Validar que el usuario tenga todos los campos necesarios
    const user = JSON.parse(userStr);
    if (!user.id || !user.email || !user.role) {
      console.warn('Datos de usuario incompletos, cerrando sesión...');
      logout();
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    // Si hay error al leer el usuario, limpiar la sesión
    logout();
    return null;
  }
  
};
