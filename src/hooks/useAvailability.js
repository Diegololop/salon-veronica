// Hook para lógica de disponibilidad de citas
import { useState, useEffect } from 'react';

export function useAvailability({ fecha, servicio, empleado }) {
  // Simulación: horarios de 9:00 a 20:00, bloques de 15min, sin solapamiento
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // Aquí iría la lógica real con Supabase
    const startHour = 9;
    const endHour = 20;
    const slotDuration = 15;
    let result = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotDuration) {
        result.push({
          time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          available: true // Simulación
        });
      }
    }
    setSlots(result);
  }, [fecha, servicio, empleado]);

  return slots;
}
