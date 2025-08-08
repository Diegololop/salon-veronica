import { Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Services } from './components/Services';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OrderDetails } from './components/OrderDetails';
import { ViewOrderDetails } from './components/ViewOrderDetails';
import { PrintOrder } from './components/PrintOrder';
import { PrintSelector } from './components/PrintSelector';
import { TechnicalPrintOrder } from './components/TechnicalPrintOrder';
import { getCurrentUser } from './lib/auth';
import { useLocation } from 'react-router-dom';
import { Inventario } from './components/Inventario';
import { PedidoPantallas } from './components/PedidoPantallas';
import { ActivityLogs } from './components/ActivityLogs';
import { CalendarView } from './features/agenda/CalendarView';
import { CreateAppointmentForm } from './features/agenda/CreateAppointmentForm';
import { useAppointmentsAPI } from './features/agenda/useAppointmentsAPI';
import ServiceReports from './components/ServiceReports';
import  ComingSoonPage  from './components/ComingSoonPage'; // Importa el componente de la página de espera
import { Toaster } from 'react-hot-toast'; 
import { ForgotPassword } from './components/ForgotPassword';
import { UpdatePassword } from './components/UpdatePassword'; // Importa el nuevo componente
import { DecisionPage } from './components/DecisionPage';
import  AprobadoPage from './components/AprobadoPage'; // Suponiendo que los creaste
import  RechazadoPage from './components/RechazadoPage'; // Suponiendo que los creaste



function App() {
  const user = getCurrentUser();
  const location = useLocation();
  const isPrintRoute = location.pathname.startsWith('/print/') || location.pathname.startsWith('/print-technical/');

  // Variable para controlar si el sitio está en modo "próximamente"
  const isComingSoon = false; // Cambia a `false` cuando quieras que el sitio esté activo

  const appointmentsAPI = useAppointmentsAPI();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Define la posición y apariencia de todos los pop-ups */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000, // Duración de 4 segundos
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {!isPrintRoute && !isComingSoon && <Header />} {/* Oculta el Header en modo "próximamente" */}
      <Routes>
        {/* Página de espera */}
        {isComingSoon && (
          <Route path="*" element={<ComingSoonPage />} /> // Captura todas las rutas
        )}

        {/* Rutas normales (solo accesibles si isComingSoon es false) */}
        {!isComingSoon && (
          <>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/servicios" element={<Services />} />

            {/* Auth route - redirect to dashboard if logged in */}
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard/*" 
              element={user ? <Layout /> : <Navigate to="/auth" replace />} 
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />


            {/* Order routes */}
            <Route
              path="/orders/:id"
              element={user ? <OrderDetails /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/orders/view/:id"
              element={user ? <ViewOrderDetails /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/print-select/:id"
              element={user ? <PrintSelector /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/print/:id"
              element={user ? <PrintOrder /> : <Navigate to="/auth" replace />}
            />
            <Route 
              path="/print-technical/:id" 
              element={user ? <TechnicalPrintOrder /> : <Navigate to="/auth" replace />}
            />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/pedido-pantallas" element={<PedidoPantallas />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/agenda" element={
              <div className="max-w-7xl mx-auto px-3 py-7 bg-gray-100 min-h-screen rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <CalendarView citas={appointmentsAPI.citas} />
                  </div>
                  <div>
                    <CreateAppointmentForm 
                      onSubmit={appointmentsAPI.addCita}
                      empleados={["Veronica", "Carla", "Sofia"]}
                      servicios={[{id: "svc_01", nombre: "Corte Mujer", duracion: 45, precio: 12000}, {id: "svc_02", nombre: "Coloración", duracion: 60, precio: 18000}]}
                    />
                  </div>
                </div>
              </div>
            } />
            <Route path="/informes" element={<ServiceReports />} />

            <Route path="/decision-presupuesto/:orden_id" element={<DecisionPage />} />

        {/* Rutas para las páginas de agradecimiento */}
            <Route path="/gracias/aprobado" element={<AprobadoPage />} />
            <Route path="/gracias/rechazado" element={<RechazadoPage />} />
          </>
        )}
      </Routes>
      {!isPrintRoute && !isComingSoon && <Footer />} {/* Oculta el Footer en modo "próximamente" */}
    </div>
  );
}

export default App;