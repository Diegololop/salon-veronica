import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAvailability } from '../../hooks/useAvailability';
import { enviarNotificacionWhatsApp } from '../../utils/notificaciones';

const servicios = [
  { id: 'svc_01', nombre: 'Corte Mujer', duracion: 45 },
  { id: 'svc_02', nombre: 'Coloración', duracion: 60 },
  { id: 'svc_03', nombre: 'Manicure', duracion: 30 },
];

export function BookingWidget() {
  const [step, setStep] = useState(1);
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState<Date | null>(null);
  const [slot, setSlot] = useState('');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', email: '' });

  // Paso 1: Selección de servicio
  const servicio = servicios.find(s => s.id === servicioId);

  // Paso 2: Disponibilidad
  const slots = useAvailability({ fecha, servicio, empleado: null });

  // Paso 3: Formulario contacto
  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Simulación de confirmación
    enviarNotificacionWhatsApp({ telefono: cliente.telefono, mensaje: `¡Hola ${cliente.nombre}! Tu cita para ${servicio?.nombre} ha sido agendada el ${fecha?.toLocaleDateString()} a las ${slot}.` });
    setStep(4);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md mx-auto">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-primary">1. Selecciona un servicio</h2>
          <select className="w-full px-3 py-2 border border-primary rounded mb-4" value={servicioId} onChange={e => setServicioId(e.target.value)} required>
            <option value="">Elige servicio...</option>
            {servicios.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
          <button disabled={!servicioId} className="bg-primary text-white px-4 py-2 rounded" onClick={() => setStep(2)}>Siguiente</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-primary">2. Elige fecha y hora</h2>
          <DatePicker
            selected={fecha}
            onChange={date => setFecha(date)}
            showTimeSelect={false}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            className="w-full px-3 py-2 border border-primary rounded mb-4"
          />
          {fecha && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Horarios disponibles</label>
              <select className="w-full px-3 py-2 border border-primary rounded" value={slot} onChange={e => setSlot(e.target.value)} required>
                <option value="">Elige horario...</option>
                {slots.map(s => s.available && (
                  <option key={s.time} value={s.time}>{s.time}</option>
                ))}
              </select>
            </div>
          )}
          <button disabled={!slot} className="bg-primary text-white px-4 py-2 rounded" onClick={() => setStep(3)}>Siguiente</button>
        </div>
      )}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-primary">3. Tus datos</h2>
          <input type="text" className="w-full px-3 py-2 border border-primary rounded mb-2" placeholder="Nombre" value={cliente.nombre} onChange={e => setCliente({ ...cliente, nombre: e.target.value })} required />
          <input type="text" className="w-full px-3 py-2 border border-primary rounded mb-2" placeholder="Teléfono" value={cliente.telefono} onChange={e => setCliente({ ...cliente, telefono: e.target.value })} required />
          <input type="email" className="w-full px-3 py-2 border border-primary rounded mb-2" placeholder="Email" value={cliente.email} onChange={e => setCliente({ ...cliente, email: e.target.value })} />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded mt-2">Reservar</button>
        </form>
      )}
      {step === 4 && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-primary">¡Cita reservada!</h2>
          <p>Te hemos enviado una confirmación por WhatsApp.</p>
        </div>
      )}
    </div>
  );
}
