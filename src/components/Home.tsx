import { Smartphone, Laptop, Clock, Shield, PenTool, Award, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';

const showReserveButton = false;

export function Home() {
  const user = getCurrentUser();

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-32 md:py-40"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2070")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bienvenida a <span className="text-secondary">Salon Veronica</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 mx-auto">
              Cortes de pelo, coloración, tratamientos y servicios de belleza en un ambiente acogedor y profesional.
            </p>
            {showReserveButton && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  user.role === 'customer' ? (
                    <Link
                      to="/dashboard"
                      className="bg-[rgba(160,198,51,1)] hover:bg-[rgba(160,198,51,0.9)] text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
                    >
                      Reservar Hora <ChevronRight className="h-5 w-5" />
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="bg-[rgba(28,164,223,1)] hover:bg-[rgba(28,164,223,0.9)] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg"
                    >
                      Ir al Dashboard
                    </Link>
                  )
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="bg-[rgba(28,164,223,1)] hover:bg-[rgba(28,164,223,0.9)] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/auth?mode=register"
                      className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-[rgba(28,164,223,0.1)] text-[rgba(28,164,223,1)] rounded-full text-sm font-medium mb-4">
              Nuestros Servicios
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Soluciones técnicas especializadas
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mobile Service */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
              <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="h-7 w-7 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Reparación de Celulares</h3>
              <p className="text-gray-600 mb-6">
                Reparación profesional de smartphones con componentes de alta calidad.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Cambio de pantalla
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Reemplazo de batería
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Reparación de puertos
                </li>
              </ul>
            </div>

            {/* Computer Service */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
              <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
                <Laptop className="h-7 w-7 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Reparación de Computadores</h3>
              <p className="text-gray-600 mb-6">
                Soluciones integrales para equipos de escritorio y portátiles.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Reparación de hardware
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Mantenimiento preventivo
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Optimización de software
                </li>
              </ul>
            </div>

            {/* Diagnostic Service */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 hover:border-[rgba(28,164,223,0.2)]">
              <div className="w-14 h-14 bg-[rgba(28,164,223,0.1)] rounded-lg flex items-center justify-center mb-6">
                <PenTool className="h-7 w-7 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Diagnóstico Gratuito</h3>
              <p className="text-gray-600 mb-6">
                Identificamos el problema de tu dispositivo sin costo alguno.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Evaluación completa
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Presupuesto detallado
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-[rgba(160,198,51,1)]" /> Sin compromiso
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-[rgba(160,198,51,0.2)] text-[rgba(160,198,51,1)] rounded-full text-sm font-medium mb-4">
              Nuestra Ventaja
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              ¿Por qué elegirnos?
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-gray-300">
              Ofrecemos un servicio técnico diferenciado con atención personalizada.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition-all">
              <div className="w-16 h-16 bg-[rgba(160,198,51,0.1)] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Clock className="h-8 w-8 text-[rgba(160,198,51,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Servicio Rápido</h3>
              <p className="text-gray-300 text-center">
                Reparaciones express con tiempos mínimos de espera y alta eficiencia.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition-all">
              <div className="w-16 h-16 bg-[rgba(160,198,51,0.1)] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="h-8 w-8 text-[rgba(160,198,51,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Garantía Asegurada</h3>
              <p className="text-gray-300 text-center">
                Todos nuestros trabajos incluyen garantía extendida por escrito.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition-all">
              <div className="w-16 h-16 bg-[rgba(160,198,51,0.1)] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="h-8 w-8 text-[rgba(160,198,51,1)]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Expertos Certificados</h3>
              <p className="text-gray-300 text-center">
                Técnicos con certificaciones oficiales y constante capacitación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[rgba(28,164,223,0.05)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center max-w-3xl mx-auto">
            <div className="p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold text-[rgba(28,164,223,1)] mb-2">+5,000</div>
              <div className="text-gray-600 text-sm md:text-base">Dispositivos reparados</div>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold text-[rgba(28,164,223,1)] mb-2">98%</div>
              <div className="text-gray-600 text-sm md:text-base">Satisfacción clientes</div>
            </div>
            <div className="p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold text-[rgba(28,164,223,1)] mb-2">20+</div>
              <div className="text-gray-600 text-sm md:text-base">Años de experiencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[rgba(160,198,51,1)] text-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para reparar tus dispositivos?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo y recibe una evaluación gratuita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
              href="tel:+56934001830"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg"
            >
              Contactar Ahora
            </a>
            {/* <Link
              to="/about"
              className="bg-transparent border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-gray-900/10 hover:shadow-lg"
            >
              Conocer Más
            </Link> */}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="font-semibold mb-1">Teléfono</h3>
              <p className="text-gray-600">+56 9 3400 1830</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-gray-600">juansandovalc@gmail.com</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-[rgba(28,164,223,1)]" />
              </div>
              <h3 className="font-semibold mb-1">Dirección</h3>
              <p className="text-gray-600">Av. Centenario 286, Of 4, 5 y 6, San Antonio Chile</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}