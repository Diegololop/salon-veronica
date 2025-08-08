import { useState } from 'react';
import { CreateAppointmentForm } from '../agenda/CreateAppointmentForm';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const estados = {
  confirmada: '#38a169', // verde
  pendiente: '#f6e05e', // amarillo
  cancelada: '#e53e3e', // rojo
};

export function AgendaInteractiva({ citas, onReagendar }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [historial, setHistorial] = useState([]);
  // Mapear citas a eventos con colores y tooltips
  const events = citas.map(cita => ({
    id: cita.id,
    title: cita.servicio,
    start: new Date(cita.fechaHora),
    end: new Date(moment(cita.fechaHora).add(cita.duracion, 'minutes').toDate()),
    resource: cita,
    allDay: false,
    style: { backgroundColor: estados[cita.estado] || '#258d96', color: '#fff' },
  }));

  // Simulación de reagendar (drag & drop)
  const handleEventDrop = ({ event, start }) => {
    onReagendar(event.id, start);
    setHistorial(prev => [{
      tipo: 'Modificación',
      cita: event.resource,
      fecha: new Date(),
    }, ...prev]);
  };

  // Abrir popup para crear cita
  const handleCrearCita = () => {
    setShowForm(true);
  };

  // Cuando se selecciona un slot en el calendario
  const handleSelectSlot = slotInfo => {
    setSelectedDate(slotInfo.start);
    setSelectedTime(slotInfo.start.getHours() + ':' + slotInfo.start.getMinutes().toString().padStart(2, '0'));
  };

  // Cuando se crea una cita
  const handleNuevaCita = cita => {
    setShowForm(false);
    setHistorial(prev => [{
      tipo: 'Creación',
      cita,
      fecha: new Date(),
    }, ...prev]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Agenda Interactiva</h2>
        <button className="bg-primary text-white px-4 py-2 rounded font-semibold" onClick={handleCrearCita}>
          + Crear Cita
        </button>
      </div>
      <div className="w-full">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600, width: '100%' }}
          views={['month', 'week', 'day']}
          popup
          tooltipAccessor={event => `Cliente: ${event.resource.cliente.nombre}\nServicio: ${event.resource.servicio}\nTeléfono: ${event.resource.cliente.telefono}`}
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true}
          onSelectSlot={handleSelectSlot}
        />
      </div>
      {/* Popup para crear cita */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowForm(false)}>&times;</button>
            <CreateAppointmentForm
              onSubmit={handleNuevaCita}
              empleados={["Veronica", "Carla", "Sofia"]}
              servicios={[{id: "svc_01", nombre: "Corte Mujer", duracion: 45, precio: 12000}, {id: "svc_02", nombre: "Coloración", duracion: 60, precio: 18000}]}
            />
          </div>
        </div>
      )}
      {/* Historial de citas */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-primary">Historial de Citas</h3>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Fecha y Hora</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">Servicio</th>
              <th className="px-4 py-2 border">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 border">{item.cita.cliente?.nombre || '-'}</td>
                <td className="px-4 py-2 border">{item.cita.fechaHora ? new Date(item.cita.fechaHora).toLocaleString() : '-'}</td>
                <td className="px-4 py-2 border">{item.cita.estado}</td>
                <td className="px-4 py-2 border">{item.cita.servicio}</td>
                <td className="px-4 py-2 border">{item.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
