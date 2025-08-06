import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './styles/print.css';
import { initializeSupabase } from './lib/supabase';

// Inicializar Supabase antes de renderizar la app
initializeSupabase().then((success) => {
  if (!success) {
    console.error('Error al inicializar la aplicación: No se pudo conectar con Supabase');
  }
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
});