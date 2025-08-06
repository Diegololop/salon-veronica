import { CheckCircle } from 'lucide-react';

export default function AprobadoPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold mt-4 text-gray-800">¡Presupuesto Aprobado!</h1>
        <p className="mt-2 text-gray-600">
          Gracias por tu confirmación. Hemos recibido tu aprobación y nuestro equipo comenzará a trabajar en tu equipo a la brevedad.
        </p>
        <a href="https://servtec.cl" className="mt-6 inline-block text-blue-600 hover:underline">
          Volver al sitio principal de Servtec
        </a>
      </div>
    </main>
  );
}