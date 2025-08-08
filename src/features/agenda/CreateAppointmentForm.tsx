import { useState } from 'react';
import { Cita } from './CalendarView';

interface Props {
  onSubmit: (cita: Cita) => void;
  empleados: string[];
  servicios: { id: string; nombre: string; duracion: number; precio: number }[];
}

export function CreateAppointmentForm({ onSubmit, empleados, servicios }: Props) {
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', email: '' });
  const [servicioId, setServicioId] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio) return;
    const cita: Cita = {
      id: Math.random().toString(36).slice(2),
      cliente,
      servicio: servicio.nombre,
      empleado,
      fechaHora: new Date(fechaHora),
      duracion: servicio.duracion,
      estado: 'pendiente',
      notas,
      precio: servicio.precio,
    };
    onSubmit(cita);
  };

  return (
    <form className="bg-white rounded-lg shadow p-4 flex flex-col gap-3" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4 text-primary">Crear Nueva Cita</h2>
      <div>
        <label className="block font-medium mb-1">Nombre Cliente</label>
        <input type="text" className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Teléfono</label>
        <input type="text" className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={cliente.telefono} onChange={e => setCliente({ ...cliente, telefono: e.target.value })} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Email</label>
        <input type="email" className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={cliente.email} onChange={e => setCliente({ ...cliente, email: e.target.value })} />
      </div>
      <div>
        <label className="block font-medium mb-1">Servicio</label>
        <select className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={servicioId} onChange={e => setServicioId(e.target.value)} required>
          <option value="">Selecciona un servicio</option>
          {servicios.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Empleado</label>
        <select className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={empleado} onChange={e => setEmpleado(e.target.value)} required>
          <option value="">Selecciona un empleado</option>
          {empleados.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Fecha y Hora</label>
        <input type="datetime-local" className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Notas</label>
        <textarea className="w-full px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50" value={notas} onChange={e => setNotas(e.target.value)} />
      </div>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded mt-4">Crear Cita</button>
    </form>
  );
}
