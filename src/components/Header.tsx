import { Link } from 'react-router-dom';
import { getCurrentUser, logout } from '../lib/auth';
import { useState } from 'react';
import { businessInfo } from '../config/businessInfo'; // Import config


const showAuthButtons = false;

export function Header() {
  const user = getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {/* Lucide icon for beauty */}
              <span className="bg-primary rounded-full p-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a8d4c4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span className="text-2xl font-bold text-primary">Salon Veronica</span>
            </Link>

            {/* Menú para escritorio */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link 
                to="/servicios" 
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Servicios
              </Link>
              <Link 
                to="/agenda" 
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Agenda
              </Link>
              <Link 
                to="/sobre-nosotros" 
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Sobre Nosotros
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-[rgba(28,164,223,1)] transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  
                  {(user.role === 'technician' || user.role === 'admin' || user.role === 'receptionist') && (
                    <>
                      <Link
                        to="/inventario"
                        className="text-gray-700 hover:text-[rgba(28,164,223,1)] transition-colors font-medium"
                      >
                        Inventario
                      </Link>
                      <Link
                        to="/pedido-pantallas"
                        className="text-gray-700 hover:text-[rgba(28,164,223,1)] transition-colors font-medium"
                      >
                        Pedido Pantallas
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link
                      to="/informes"
                      className="text-gray-700 hover:text-[rgba(28,164,223,1)] transition-colors font-medium"
                    >
                      Informes
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-[rgba(160,198,51,1)] transition-colors font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  {showAuthButtons && (
                    <>
                      <Link 
                        to="/auth" 
                        className="text-gray-700 hover:text-[rgba(28,164,223,1)] transition-colors font-medium"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/auth?register=true"
                        className="bg-[rgba(28,164,223,1)] text-white px-4 py-2 rounded-md hover:bg-[rgba(28,164,223,0.9)] transition-colors font-medium"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-gray-700 hover:text-[rgba(28,164,223,1)] focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                ></path>
              </svg>
            </button>
          </div>

          {/* Menú móvil */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <Link 
                to="/" 
                className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                onClick={toggleMobileMenu}
              >
                Inicio
              </Link>
              <Link 
                to="/servicios" 
                className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                onClick={toggleMobileMenu}
              >
                Servicios
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Dashboard
                  </Link>
                  
                  {(user.role === 'technician' || user.role === 'admin' || user.role === 'receptionist') && (
                    <>
                      <Link
                        to="/inventario"
                        className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                        onClick={toggleMobileMenu}
                      >
                        Inventario
                      </Link>
                      <Link
                        to="/pedido-pantallas"
                        className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                        onClick={toggleMobileMenu}
                      >
                        Pedido Pantallas
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link
                      to="/informes"
                      className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      Informes
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-[rgba(160,198,51,0.1)] hover:text-[rgba(160,198,51,1)] rounded transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  {showAuthButtons && (
                    <>
                      <Link 
                        to="/auth" 
                        className="block py-2 px-4 text-gray-700 hover:bg-[rgba(28,164,223,0.1)] hover:text-[rgba(28,164,223,1)] rounded transition-colors"
                        onClick={toggleMobileMenu}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/auth?register=true"
                        className="block text-center bg-[rgba(28,164,223,1)] text-white px-4 py-2 rounded-md hover:bg-[rgba(28,164,223,0.9)] transition-colors mt-2"
                        onClick={toggleMobileMenu}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}