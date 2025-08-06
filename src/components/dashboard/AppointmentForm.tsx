import { useState } from 'react';
import { Calendar, Clock, Wrench } from 'lucide-react';

interface AppointmentFormProps {
  onSubmit: (appointment: {
    date: string;
    time: string;
    description: string;
    equipmentType: string;
    brand: string;
    model: string;
  }) => void;
  loading: boolean;
}

export function AppointmentForm({ onSubmit, loading }: AppointmentFormProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  // Get available hours based on the selected date
  const getAvailableHours = () => {
    if (!date) return [];

    // Create date object in local timezone
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const hours = [];
    
    // Sábado: 10:00 - 16:00
    // Lunes a Viernes: 10:00 - 18:00
    const startHour = 10;
    const endHour = dayOfWeek === 6 ? 16 : 18;

    for (let i = startHour; i < endHour; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }

    return hours;
  };

  // Get minimum date (today) and maximum date (2 months from today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    return twoMonthsFromNow.toISOString().split('T')[0];
  };

  // Validar la fecha seleccionada
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek === 0) {
      alert('No se pueden hacer reservas los domingos. Por favor, seleccione otro día.');
      setDate('');
      setTime('');
      return;
    }

    setDate(e.target.value);
    // Limpiar la hora cuando se cambia la fecha
    setTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación adicional antes de enviar
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek === 0) {
      alert('No se pueden hacer reservas los domingos.');
      return;
    }

    onSubmit({
      date,
      time,
      description,
      equipmentType,
      brand,
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Calendar className="h-5 w-5" />
            </span>
            <input
              type="date"
              required
              min={getMinDate()}
              max={getMaxDate()}
              className="pl-10 w-full p-2 border rounded-md"
              value={date}
              onChange={handleDateChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Lunes a viernes: 10:00 - 18:00<br />
            Sábados: 10:00 - 16:00<br />
            Domingos: No disponible
          </p>
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Clock className="h-5 w-5" />
            </span>
            <select
              required
              className={`pl-10 w-full p-2 border rounded-md ${!date ? 'bg-gray-100' : ''}`}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date}
            >
              <option value="">Seleccionar hora</option>
              {getAvailableHours().map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de Equipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Equipo
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Wrench className="h-5 w-5" />
            </span>
            <select
              required
              className="pl-10 w-full p-2 border rounded-md"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
            >
              <option value="">Seleccionar tipo</option>
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Computador de Escritorio</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ej: Samsung, Apple, Lenovo..."
          />
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-md"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Ej: Galaxy S21, MacBook Pro..."
          />
        </div>
      </div>

      {/* Descripción del Problema */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del Problema
        </label>
        <textarea
          required
          className="w-full p-2 border rounded-md"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el problema que presenta tu equipo..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? 'Reservando...' : 'Reservar Hora'}
      </button>
    </form>
  );
}