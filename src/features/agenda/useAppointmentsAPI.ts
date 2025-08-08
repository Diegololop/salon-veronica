import { useState, useEffect } from 'react';
import { Cita } from './CalendarView';

// Simulación de API (reemplazar con Supabase)
export function useAppointmentsAPI() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Aquí iría la llamada a Supabase
    setLoading(true);
    setTimeout(() => {
      setCitas([]); // Inicialmente vacío
      setLoading(false);
    }, 500);
  }, []);

  const addCita = (cita: Cita) => {
    setCitas(prev => [...prev, cita]);
  };

  return { citas, loading, addCita };
}
