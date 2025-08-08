import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { businessInfo, getPhoneLink, getEmailLink } from '../config/businessInfo';

export function Footer() {
  // Datos fijos para Salon Veronica
  const name = 'Salon Veronica';
  const description = 'Con más de 10 años de experiencia, ofrecemos cortes de pelo, coloración, tratamientos y servicios de belleza de alta calidad en un ambiente acogedor.';
  const contact = {
    phone: '+56 9 1234 5678',
    email: 'contacto@salonveronica.cl',
    address: { full: 'Av. Providencia 1234, Santiago, Chile' }
  };
  const online = { getGoogleMapsLink: () => 'https://goo.gl/maps/xyz123' };

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* CORRECCIÓN 1: Se reduce el padding vertical de py-12 a py-8 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[rgba(160,198,51,1)]">{name}</h3>
            <p className="text-gray-400">{description}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[rgba(160,198,51,1)]">Contacto</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleClick(getPhoneLink(contact.phone))}
                className="flex items-center hover:text-[rgba(28,164,223,1)] transition-colors w-full text-left group"
              >
                <div className="w-8 h-8 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mr-3 group-hover:bg-[rgba(28,164,223,0.2)] transition-colors">
                  <Phone className="h-4 w-4 text-[rgba(28,164,223,1)]" />
                </div>
                <span>{contact.phone}</span>
              </button>
              <button 
                onClick={() => handleClick(getEmailLink(contact.email))}
                className="flex items-center hover:text-[rgba(28,164,223,1)] transition-colors w-full text-left group"
              >
                <div className="w-8 h-8 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mr-3 group-hover:bg-[rgba(28,164,223,0.2)] transition-colors">
                  <Mail className="h-4 w-4 text-[rgba(28,164,223,1)]" />
                </div>
                <span>{contact.email}</span>
              </button>
              <button 
                onClick={() => handleClick(online.getGoogleMapsLink())}
                className="flex items-center hover:text-[rgba(28,164,223,1)] transition-colors w-full text-left group"
              >
                <div className="w-8 h-8 bg-[rgba(28,164,223,0.1)] rounded-full flex items-center justify-center mr-3 group-hover:bg-[rgba(28,164,223,0.2)] transition-colors">
                  <MapPin className="h-4 w-4 text-[rgba(28,164,223,1)]" />
                </div>
                <span className="text-sm">{contact.address.full}</span>
              </button>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary">Horario</h3>
            <div className="space-y-3">
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-3 group-hover:bg-secondary/20 transition-colors">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p>Lunes a Sábado</p>
                  <p className="text-gray-400">09:00 - 20:00</p>
                </div>
              </div>
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-3 group-hover:bg-secondary/20 transition-colors">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p>Domingo</p>
                  <p className="text-gray-400">Cerrado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Payment */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-secondary">Redes Sociales</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleClick('https://facebook.com/salonveronica')}
                className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-secondary" />
              </button>
              <button
                onClick={() => handleClick('https://instagram.com/salonveronica')}
                className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-secondary" />
              </button>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-2">Métodos de Pago</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/5 px-2 py-1 rounded text-xs">Efectivo</div>
                <div className="bg-white/5 px-2 py-1 rounded text-xs">Tarjeta Débito</div>
                <div className="bg-white/5 px-2 py-1 rounded text-xs">Tarjeta Crédito</div>
                <div className="bg-white/5 px-2 py-1 rounded text-xs">Transferencia</div>
              </div>
            </div>
          </div>
        </div>

        {/* CORRECCIÓN 2: Se reduce el margen superior de mt-12 a mt-8 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p className="text-sm">© {new Date().getFullYear()} {name} - Todos los derechos reservados</p>
          <p className="text-xs mt-2">&copy; 2025 Salon Veronica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}