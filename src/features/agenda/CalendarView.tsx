import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Estructura de cita
export interface Cita {
  id: string;
  cliente: { nombre: string; telefono: string; email?: string };
  servicio: string;
  empleado: string;
  fechaHora: Date;
  duracion: number;
  estado: 'confirmada' | 'completada' | 'cancelada' | 'pendiente';
  notas?: string;
  precio: number;
}

const localizer = momentLocalizer(moment);

export function CalendarView({ citas }: { citas: Cita[] }) {
  // Mapear citas a eventos para el calendario
  const events = citas.map(cita => ({
    id: cita.id,
    title: `${cita.servicio} - ${cita.cliente.nombre}`,
    start: new Date(cita.fechaHora),
    end: new Date(moment(cita.fechaHora).add(cita.duracion, 'minutes').toDate()),
    resource: cita,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-2xl font-bold mb-4 text-primary">Agenda de Citas</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day']}
        popup
      />
    </div>
  );
}
