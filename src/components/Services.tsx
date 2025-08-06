import { Smartphone, Laptop, Battery, Wifi, Monitor, HardDrive, Cpu, ShieldCheck, Wrench, Settings, Brush as Virus, Database } from 'lucide-react';

export function Services() {
  return (
    <main className="py-12 bg-gray-50">
      {/* Mobile Services */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[rgba(28,164,223,0.1)] text-[rgba(28,164,223,1)] rounded-full text-sm font-medium mb-4">
            Servicios Especializados
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Servicios para Celulares</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Soluciones profesionales para smartphones de todas las marcas con componentes de calidad garantizada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Monitor className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Cambio de Pantalla</h3>
            <p className="text-gray-600 mb-4">
              Reemplazo profesional de pantallas con cristales originales o de alta calidad.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Pantallas OLED/AMOLED
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Garantía por escrito
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Servicio express
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Battery className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Reemplazo de Batería</h3>
            <p className="text-gray-600 mb-4">
              Baterías nuevas con certificación que restauran la autonomía original.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Baterías certificadas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Diagnóstico gratuito
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Instalación profesional
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Wifi className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Conectividad</h3>
            <p className="text-gray-600 mb-4">
              Reparación de problemas de WiFi, Bluetooth, NFC y señal celular.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Diagnóstico preciso
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Reparación de antenas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Solución garantizada
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Wrench className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Hardware</h3>
            <p className="text-gray-600 mb-4">
              Reparación de componentes físicos y problemas mecánicos.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Puertos de carga
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Botones y switches
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Altavoces y micrófonos
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Settings className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Software</h3>
            <p className="text-gray-600 mb-4">
              Solución de problemas del sistema operativo y optimización.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Actualizaciones
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Restauración de fábrica
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Liberación de espacio
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
            <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Database className="h-7 w-7 text-[rgba(28,164,223,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Recuperación de Datos</h3>
            <p className="text-gray-600 mb-4">
              Recuperamos tu información importante de dispositivos dañados.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Fotos y videos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Contactos y mensajes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(160,198,51,1)] rounded-full"></span>
                Archivos y documentos
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Computer Services */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[rgba(160,198,51,0.1)] text-[rgba(160,198,51,1)] rounded-full text-sm font-medium mb-4">
            Tecnología Profesional
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Servicios para Computadores</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reparación y mantenimiento de PCs y laptops con componentes de primera calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <HardDrive className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Almacenamiento</h3>
            <p className="text-gray-600 mb-4">
              Actualización a SSD y recuperación de datos de discos dañados.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Migración a SSD
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Recuperación de datos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Configuración RAID
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Cpu className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Actualización</h3>
            <p className="text-gray-600 mb-4">
              Mejora el rendimiento de tu equipo con hardware actualizado.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Memoria RAM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Procesadores
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Tarjetas gráficas
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Virus className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Seguridad</h3>
            <p className="text-gray-600 mb-4">
              Eliminación de virus y protección contra malware.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Escaneo profundo
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Antivirus premium
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Protección en tiempo real
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Settings className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Mantenimiento</h3>
            <p className="text-gray-600 mb-4">
              Limpieza y optimización para prolongar la vida útil de tu equipo.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Limpieza física
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Actualización de drivers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Optimización de sistema
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Respaldo</h3>
            <p className="text-gray-600 mb-4">
              Protege tu información importante con nuestros sistemas de backup.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Copia en la nube
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Discos externos
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Automatización
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(160,198,51,0.2)]">
            <div className="w-14 h-14 bg-[rgba(160,198,51,0.1)] rounded-lg flex items-center justify-center mb-6">
              <Laptop className="h-7 w-7 text-[rgba(160,198,51,1)]" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Laptops</h3>
            <p className="text-gray-600 mb-4">
              Reparación especializada para computadores portátiles.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Pantallas y bisagras
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Teclados y touchpads
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[rgba(28,164,223,1)] rounded-full"></span>
                Sistemas de refrigeración
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}